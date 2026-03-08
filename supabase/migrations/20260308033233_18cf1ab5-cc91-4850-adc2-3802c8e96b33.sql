
-- Create user_media table
CREATE TABLE public.user_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  r2_key TEXT NOT NULL,
  r2_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Create index
CREATE INDEX idx_user_media_user_id ON public.user_media (user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.user_media ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view own non-deleted media
CREATE POLICY "Users can view own media"
  ON public.user_media FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- RLS: Users can insert own media
CREATE POLICY "Users can insert own media"
  ON public.user_media FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS: Users can update own media (for soft delete)
CREATE POLICY "Users can update own media"
  ON public.user_media FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Deny hard deletes
CREATE POLICY "Deny hard deletes on user_media"
  ON public.user_media FOR DELETE
  TO authenticated
  USING (false);
