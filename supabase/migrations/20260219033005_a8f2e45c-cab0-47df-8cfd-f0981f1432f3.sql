
-- Add media_type column to generations table to support video and audio persistence
ALTER TABLE public.generations 
ADD COLUMN media_type text NOT NULL DEFAULT 'image';

-- Update RLS policies to also allow updates on own generations (for sharing etc.)
CREATE POLICY "Users can update their own generations"
ON public.generations
FOR UPDATE
USING (auth.uid() = user_id);
