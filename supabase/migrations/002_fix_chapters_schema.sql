-- Fix chapters table schema to match expected columns
-- This migration adds missing columns that the backend code expects

-- Add content_points column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'chapters' 
    AND column_name = 'content_points'
  ) THEN
    ALTER TABLE public.chapters ADD COLUMN content_points TEXT[];
  END IF;
END $$;

-- Add note column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'chapters' 
    AND column_name = 'note'
  ) THEN
    ALTER TABLE public.chapters ADD COLUMN note TEXT;
  END IF;
END $$;

-- Add completed column if it doesn't exist (for user progress tracking)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'chapters' 
    AND column_name = 'completed'
  ) THEN
    ALTER TABLE public.chapters ADD COLUMN completed BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Ensure jsx_content is NOT NULL (add if missing, or alter if exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'chapters' 
    AND column_name = 'jsx_content'
  ) THEN
    ALTER TABLE public.chapters ADD COLUMN jsx_content TEXT NOT NULL DEFAULT '';
  ELSE
    -- If it exists but is nullable, make it NOT NULL with default
    ALTER TABLE public.chapters 
    ALTER COLUMN jsx_content SET NOT NULL,
    ALTER COLUMN jsx_content SET DEFAULT '';
  END IF;
END $$;

-- Ensure key_takeaways exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'chapters' 
    AND column_name = 'key_takeaways'
  ) THEN
    ALTER TABLE public.chapters ADD COLUMN key_takeaways TEXT[];
  END IF;
END $$;

-- Add summary column if it doesn't exist (for frontend compatibility)
-- This can be computed from content_points or jsx_content if needed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'chapters' 
    AND column_name = 'summary'
  ) THEN
    ALTER TABLE public.chapters ADD COLUMN summary TEXT;
  END IF;
END $$;




