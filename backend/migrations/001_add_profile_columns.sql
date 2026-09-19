-- ============================================================================
-- Raketbase — Freelancer Profile Schema Migration
-- Adds new profile columns to public.users table
-- Safe to run multiple times (uses IF NOT EXISTS / idempotent ALTER ADD COLUMN)
-- ============================================================================

-- Professional title (e.g. "Full Stack Developer")
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS title text;

-- Avatar URL (Supabase Storage public URL)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url text;

-- Contact phone number
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text;

-- Location (e.g. "Manila, Philippines")
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location text;

-- Hourly rate in PHP
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS hourly_rate numeric;

-- Social links
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS github_url text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS website_url text;

-- Work experience (JSON array of objects)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS experience jsonb DEFAULT '[]'::jsonb;

-- Education (JSON array of objects)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS education jsonb DEFAULT '[]'::jsonb;


-- ============================================================================
-- Supabase Storage — Create 'avatars' bucket (run in SQL Editor)
-- NOTE: Bucket creation is typically done via Supabase Dashboard > Storage.
--       If you prefer SQL, uncomment the following:
-- ============================================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policy: Allow authenticated users to upload their own avatars
-- INSERT INTO storage.objects is handled by Supabase Storage API
-- You need to set the following policies in the Supabase Dashboard:
--   1. SELECT (public): Allow anyone to view avatars
--   2. INSERT: Allow authenticated users to upload to their own folder
--   3. UPDATE: Allow authenticated users to update their own files
--   4. DELETE: Allow authenticated users to delete their own files

