
-- Make the generations bucket private
UPDATE storage.buckets SET public = false WHERE id = 'generations';

-- Drop the existing permissive SELECT policy that allows anyone to read
DROP POLICY IF EXISTS "Anyone can view generation files" ON storage.objects;
DROP POLICY IF EXISTS "Public access to generations" ON storage.objects;

-- Ensure authenticated users can read their own files
CREATE POLICY "Users can read own generation files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'generations'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Ensure authenticated users can still upload to their own folder
DROP POLICY IF EXISTS "Users can upload their own generation files" ON storage.objects;
CREATE POLICY "Users can upload their own generation files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generations'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Ensure authenticated users can delete their own files
DROP POLICY IF EXISTS "Users can delete their own generation files" ON storage.objects;
CREATE POLICY "Users can delete their own generation files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'generations'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow service role (edge functions) full access - handled automatically by Supabase
