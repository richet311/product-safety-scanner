-- =============================================
-- Surfelt — Migration 3
-- Paste into: Supabase Dashboard → SQL Editor → New query
-- Safe to re-run (uses IF NOT EXISTS / ON CONFLICT / DROP IF EXISTS)
-- =============================================


-- ─────────────────────────────────────────────
-- 1. PROFILES — add missing columns
-- ─────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_scan_limit INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS first_name  TEXT,
  ADD COLUMN IF NOT EXISTS last_name   TEXT,
  ADD COLUMN IF NOT EXISTS username    TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS phone       TEXT;


-- ─────────────────────────────────────────────
-- 2. AUTO-CREATE PROFILE ON SIGNUP
--    Runs as SECURITY DEFINER so it can write
--    to public.profiles even during auth flow.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────────
-- 3. BACKFILL — create profiles for existing
--    auth users that don't have one yet
-- ─────────────────────────────────────────────
INSERT INTO public.profiles (id)
SELECT u.id
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────
-- 4. STORAGE — convert existing full public URLs
--    to relative paths so signed URLs work
--    e.g. "https://.../object/public/scan-images/abc/123.jpg"
--      →  "abc/123.jpg"
-- ─────────────────────────────────────────────
UPDATE public.scans
SET image_url = regexp_replace(
  image_url,
  '^.*/object/public/scan-images/(.+)$',
  '\1'
)
WHERE image_url LIKE '%/object/public/scan-images/%';


-- ─────────────────────────────────────────────
-- 5. STORAGE — make bucket private
--    After this, the public /object/public/ URL
--    endpoint stops working. The app now uses
--    signed URLs generated server-side.
-- ─────────────────────────────────────────────
UPDATE storage.buckets
SET public = false
WHERE id = 'scan-images';


-- ─────────────────────────────────────────────
-- 6. STORAGE RLS — replace open public read
--    with authenticated owner-only read
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "scan-images: public read"             ON storage.objects;
DROP POLICY IF EXISTS "scan-images: authenticated read own"  ON storage.objects;
-- also drop old name in case it was created differently
DROP POLICY IF EXISTS "scan-images: authenticated upload"    ON storage.objects;
DROP POLICY IF EXISTS "scan-images: owner delete"            ON storage.objects;

-- Upload: authenticated users may only write into their own folder
CREATE POLICY "scan-images: authenticated upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'scan-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read: authenticated users may only read their own folder
CREATE POLICY "scan-images: authenticated read own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'scan-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Delete: authenticated users may only delete their own files
CREATE POLICY "scan-images: owner delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'scan-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
