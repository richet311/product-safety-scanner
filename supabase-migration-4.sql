-- =============================================
-- Surfelt - Migration 4: profile/storage audit
-- Paste into: Supabase Dashboard -> SQL Editor -> New query
-- Safe to re-run.
-- =============================================


-- 1. Ensure every auth user has a public profile row.
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

INSERT INTO public.profiles (id)
SELECT u.id
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;


-- 2. Ensure scan-images is private and owner-scoped by uid folder.
UPDATE storage.buckets
SET public = false
WHERE id = 'scan-images';

DROP POLICY IF EXISTS "scan-images: public read"             ON storage.objects;
DROP POLICY IF EXISTS "scan-images: authenticated read own"  ON storage.objects;
DROP POLICY IF EXISTS "scan-images: authenticated upload"    ON storage.objects;
DROP POLICY IF EXISTS "scan-images: owner delete"            ON storage.objects;

CREATE POLICY "scan-images: authenticated upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'scan-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "scan-images: authenticated read own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'scan-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "scan-images: owner delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'scan-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- 3. Diagnostics: these result sets explain why storage may show fewer
--    folders than auth users. A storage folder exists only after a user
--    uploads a photo file to scan-images/{uid}/...

-- Count auth users vs profiles vs users with saved scans.
SELECT
  (SELECT COUNT(*) FROM auth.users) AS auth_users,
  (SELECT COUNT(*) FROM public.profiles) AS profiles,
  (SELECT COUNT(DISTINCT user_id) FROM public.scans) AS users_with_scans,
  (
    SELECT COUNT(DISTINCT (storage.foldername(name))[1])
    FROM storage.objects
    WHERE bucket_id = 'scan-images'
  ) AS users_with_scan_image_files;

-- Auth users missing profile rows. Should return zero rows after the backfill above.
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- Users who have scans but no Supabase Storage photo files.
-- This is expected for barcode/name scans or scans using external product images.
SELECT
  s.user_id,
  COUNT(*) AS scan_count,
  COUNT(*) FILTER (WHERE s.image_url IS NOT NULL) AS scans_with_image_url,
  COUNT(*) FILTER (WHERE s.image_url IS NOT NULL AND s.image_url NOT LIKE 'http%') AS scans_with_storage_path,
  COUNT(o.name) AS storage_object_count
FROM public.scans s
LEFT JOIN storage.objects o
  ON o.bucket_id = 'scan-images'
  AND (storage.foldername(o.name))[1] = s.user_id::text
GROUP BY s.user_id
HAVING COUNT(o.name) = 0
ORDER BY scan_count DESC;

-- Stored objects whose top-level folder is not an auth user id.
-- Should return zero rows if all uploads are under {uid}/filename.
SELECT o.name, o.created_at
FROM storage.objects o
LEFT JOIN auth.users u ON u.id::text = (storage.foldername(o.name))[1]
WHERE o.bucket_id = 'scan-images'
  AND u.id IS NULL
ORDER BY o.created_at DESC;
