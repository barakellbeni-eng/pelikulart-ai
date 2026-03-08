
UPDATE storage.buckets SET public = true WHERE id = 'generations';

-- Add storage policies for the generations bucket
CREATE POLICY "Users can upload to generations" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'generations' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own files from generations" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'generations' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can read generations" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'generations');
