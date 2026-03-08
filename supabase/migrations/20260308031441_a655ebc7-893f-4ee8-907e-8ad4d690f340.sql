
CREATE TABLE public.generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  external_job_id TEXT,
  provider TEXT NOT NULL DEFAULT 'fal',
  tool_type TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  params JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER NOT NULL DEFAULT 0,
  result_url TEXT,
  result_url_temp TEXT,
  result_metadata JSONB DEFAULT '{}'::jsonb,
  credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Validation trigger for status
CREATE OR REPLACE FUNCTION public.validate_generation_job_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'processing', 'completed', 'failed') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  IF NEW.tool_type NOT IN ('image', 'video', 'audio') THEN
    RAISE EXCEPTION 'Invalid tool_type: %', NEW.tool_type;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_generation_job
BEFORE INSERT OR UPDATE ON public.generation_jobs
FOR EACH ROW EXECUTE FUNCTION public.validate_generation_job_status();

-- Enable RLS
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view their own non-deleted jobs
CREATE POLICY "Users can view own jobs"
ON public.generation_jobs FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Users can insert their own jobs
CREATE POLICY "Users can insert own jobs"
ON public.generation_jobs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can soft-delete their own jobs (update deleted_at only)
CREATE POLICY "Users can update own jobs"
ON public.generation_jobs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- No hard deletes from client
CREATE POLICY "Deny hard deletes"
ON public.generation_jobs FOR DELETE
TO authenticated
USING (false);

-- Index for fast user queries
CREATE INDEX idx_generation_jobs_user_status ON public.generation_jobs (user_id, status, created_at DESC);
CREATE INDEX idx_generation_jobs_external ON public.generation_jobs (external_job_id) WHERE external_job_id IS NOT NULL;
