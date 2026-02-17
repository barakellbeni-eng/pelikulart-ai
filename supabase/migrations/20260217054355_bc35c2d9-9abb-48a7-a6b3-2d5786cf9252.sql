
-- Add is_public flag to generations
ALTER TABLE public.generations ADD COLUMN is_public boolean NOT NULL DEFAULT false;

-- Add creator display name for community display
ALTER TABLE public.generations ADD COLUMN creator_name text;

-- Allow anyone (authenticated) to view public generations
CREATE POLICY "Anyone can view public generations"
ON public.generations FOR SELECT
USING (is_public = true);

-- Index for fast community feed queries
CREATE INDEX idx_generations_public ON public.generations (is_public, created_at DESC) WHERE is_public = true;
