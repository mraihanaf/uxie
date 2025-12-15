-- Uxie Initial Schema
-- Enable pgvector extension for RAG embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- TABLES
-- ============================================

-- Users profile table (extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  image_query TEXT,
  total_time_hours DECIMAL(4,2),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  language TEXT CHECK (language IN ('en', 'id')),
  status TEXT DEFAULT 'creating' CHECK (status IN ('creating', 'finished', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapters table
CREATE TABLE public.chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  index INTEGER NOT NULL,
  caption TEXT NOT NULL,
  content_points TEXT[], -- Learning points from planner
  jsx_content TEXT NOT NULL, -- The JSX code from explainer
  key_takeaways TEXT[], -- Key points from chapter
  time_minutes INTEGER,
  image_url TEXT,
  note TEXT, -- Optional note from planner
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, index)
);

-- Questions table
CREATE TABLE public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  index INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'open_text')),
  question TEXT NOT NULL,
  answer_a TEXT,
  answer_b TEXT,
  answer_c TEXT,
  answer_d TEXT,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  grading_criteria TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress table
CREATE TABLE public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  quiz_score INTEGER,
  quiz_total INTEGER,
  quiz_completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- Document embeddings for RAG
CREATE TABLE public.document_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  content_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI/compatible embedding dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, content_id)
);

-- Uploaded documents tracking
CREATE TABLE public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  storage_path TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Vector similarity search index
CREATE INDEX idx_document_embeddings_vector ON public.document_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Common query indexes
CREATE INDEX idx_courses_user_id ON public.courses(user_id);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_chapters_course_id ON public.chapters(course_id);
CREATE INDEX idx_questions_chapter_id ON public.questions(chapter_id);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_course_id ON public.user_progress(course_id);
CREATE INDEX idx_document_embeddings_course_id ON public.document_embeddings(course_id);
CREATE INDEX idx_documents_course_id ON public.documents(course_id);

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Add document embedding with text
CREATE OR REPLACE FUNCTION add_document_embedding(
  p_course_id UUID,
  p_content_id TEXT,
  p_content TEXT,
  p_embedding vector(1536),
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
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

-- Search documents by vector similarity
CREATE OR REPLACE FUNCTION search_documents(
  p_course_id UUID,
  p_query_embedding vector(1536),
  p_limit INTEGER DEFAULT 5,
  p_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  content_id TEXT,
  content TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    de.content_id,
    de.content,
    (1 - (de.embedding <=> p_query_embedding))::FLOAT as similarity,
    de.metadata
  FROM public.document_embeddings de
  WHERE de.course_id = p_course_id
    AND (1 - (de.embedding <=> p_query_embedding)) > p_threshold
  ORDER BY de.embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$;

-- Get course progress summary
CREATE OR REPLACE FUNCTION get_course_progress(
  p_course_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  total_chapters INTEGER,
  completed_chapters INTEGER,
  total_quiz_score INTEGER,
  total_quiz_possible INTEGER,
  progress_percentage FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.chapters WHERE course_id = p_course_id) as total_chapters,
    (SELECT COUNT(*)::INTEGER FROM public.user_progress WHERE course_id = p_course_id AND user_id = p_user_id AND completed = true) as completed_chapters,
    (SELECT COALESCE(SUM(quiz_score), 0)::INTEGER FROM public.user_progress WHERE course_id = p_course_id AND user_id = p_user_id) as total_quiz_score,
    (SELECT COALESCE(SUM(quiz_total), 0)::INTEGER FROM public.user_progress WHERE course_id = p_course_id AND user_id = p_user_id) as total_quiz_possible,
    (SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE (COUNT(*) FILTER (WHERE completed = true)::FLOAT / COUNT(*)::FLOAT * 100)
      END
    FROM public.user_progress WHERE course_id = p_course_id AND user_id = p_user_id) as progress_percentage;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Courses policies
CREATE POLICY "Users can view own courses" ON public.courses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own courses" ON public.courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own courses" ON public.courses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own courses" ON public.courses
  FOR DELETE USING (auth.uid() = user_id);

-- Chapters policies (access via course ownership)
CREATE POLICY "Users can view chapters of own courses" ON public.chapters
  FOR SELECT USING (
    course_id IN (SELECT id FROM public.courses WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert chapters to own courses" ON public.chapters
  FOR INSERT WITH CHECK (
    course_id IN (SELECT id FROM public.courses WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update chapters of own courses" ON public.chapters
  FOR UPDATE USING (
    course_id IN (SELECT id FROM public.courses WHERE user_id = auth.uid())
  );

-- Questions policies (access via chapter -> course ownership)
CREATE POLICY "Users can view questions of own courses" ON public.questions
  FOR SELECT USING (
    chapter_id IN (
      SELECT c.id FROM public.chapters c
      JOIN public.courses co ON c.course_id = co.id
      WHERE co.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert questions to own courses" ON public.questions
  FOR INSERT WITH CHECK (
    chapter_id IN (
      SELECT c.id FROM public.chapters c
      JOIN public.courses co ON c.course_id = co.id
      WHERE co.user_id = auth.uid()
    )
  );

-- User progress policies
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Document embeddings policies (access via course ownership)
CREATE POLICY "Users can view embeddings of own courses" ON public.document_embeddings
  FOR SELECT USING (
    course_id IN (SELECT id FROM public.courses WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert embeddings to own courses" ON public.document_embeddings
  FOR INSERT WITH CHECK (
    course_id IN (SELECT id FROM public.courses WHERE user_id = auth.uid())
  );

-- Documents policies
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SERVICE ROLE BYPASS (for backend operations)
-- ============================================

-- Allow service role to bypass RLS for backend operations
CREATE POLICY "Service role can do anything on courses" ON public.courses
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can do anything on chapters" ON public.chapters
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can do anything on questions" ON public.questions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can do anything on user_progress" ON public.user_progress
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can do anything on document_embeddings" ON public.document_embeddings
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can do anything on documents" ON public.documents
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

