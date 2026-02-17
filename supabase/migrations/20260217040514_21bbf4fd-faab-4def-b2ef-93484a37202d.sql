
-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('generations', 'generations', true);

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own generations"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generations'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access (images are public)
CREATE POLICY "Anyone can view generations"
ON storage.objects FOR SELECT
USING (bucket_id = 'generations');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own generations"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'generations'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create generations history table
CREATE TABLE public.generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  aspect_ratio TEXT DEFAULT '1:1',
  resolution TEXT DEFAULT '2K',
  output_format TEXT DEFAULT 'png',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generations"
ON public.generations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generations"
ON public.generations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations"
ON public.generations FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_generations_user_id ON public.generations (user_id);
CREATE INDEX idx_generations_created_at ON public.generations (created_at DESC);
