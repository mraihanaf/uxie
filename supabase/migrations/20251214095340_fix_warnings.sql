-- 003_fix_warnings.sql
-- Fix function search_path and vector type issues

-- ==========================================
-- 1. Ensure a dedicated schema for extensions
-- ==========================================
CREATE SCHEMA IF NOT EXISTS extensions;

-- Install or move vector extension into the schema
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'vector'
  ) THEN
    CREATE EXTENSION vector SCHEMA extensions;
  ELSE
    ALTER EXTENSION vector SET SCHEMA extensions;
  END IF;
END $$;

-- ==========================================
-- 2. Fix functions with mutable search_path
-- ==========================================

-- Ensure functions can see the vector type
SET search_path = public, extensions, pg_catalog;

-- add_document_embedding
CREATE OR REPLACE FUNCTION public.add_document_embedding(
  p_course_id uuid,
  p_content_id text,
  p_content text,
  p_embedding extensions.vector(1536),
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.document_embeddings (course_id, content_id, content, embedding, metadata)
  VALUES (p_course_id, p_content_id, p_content, p_embedding, p_metadata)
  ON CONFLICT (course_id, content_id)
  DO UPDATE SET 
    content = EXCLUDED.content,
    embedding = EXCLUDED.embedding,
    metadata = EXCLUDED.metadata
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- search_documents
CREATE OR REPLACE FUNCTION public.search_documents(
  p_course_id uuid,
  p_query_embedding extensions.vector(1536),
  p_limit integer DEFAULT 5,
  p_threshold float DEFAULT 0.7
)
RETURNS TABLE (
  content_id text,
  content text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    de.content_id,
    de.content,
    (1 - (de.embedding <=> p_query_embedding))::float as similarity,
    de.metadata
  FROM public.document_embeddings de
  WHERE de.course_id = p_course_id
    AND (1 - (de.embedding <=> p_query_embedding)) > p_threshold
  ORDER BY de.embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$;

-- get_course_progress
CREATE OR REPLACE FUNCTION public.get_course_progress(
  p_course_id uuid,
  p_user_id uuid
)
RETURNS TABLE (
  total_chapters integer,
  completed_chapters integer,
  total_quiz_score integer,
  total_quiz_possible integer,
  progress_percentage float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::integer FROM public.chapters WHERE course_id = p_course_id) as total_chapters,
    (SELECT COUNT(*)::integer FROM public.user_progress WHERE course_id = p_course_id AND user_id = p_user_id AND completed = true) as completed_chapters,
    (SELECT COALESCE(SUM(quiz_score),0)::integer FROM public.user_progress WHERE course_id = p_course_id AND user_id = p_user_id) as total_quiz_score,
    (SELECT COALESCE(SUM(quiz_total),0)::integer FROM public.user_progress WHERE course_id = p_course_id AND user_id = p_user_id) as total_quiz_possible,
    (SELECT 
      CASE WHEN COUNT(*) = 0 THEN 0
      ELSE (COUNT(*) FILTER (WHERE completed = true)::float / COUNT(*)::float * 100)
      END
    FROM public.user_progress WHERE course_id = p_course_id AND user_id = p_user_id) as progress_percentage;
END;
$$;

-- update_updated_at_column trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  RETURN NEW;
END;
$$;
