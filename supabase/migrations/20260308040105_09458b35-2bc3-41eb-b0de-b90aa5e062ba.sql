
-- 1. Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Sans titre',
  cover_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Add project_id to generation_jobs
ALTER TABLE public.generation_jobs
  ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- 5. Add project_id to generations (legacy)
ALTER TABLE public.generations
  ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- 6. Indexes
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_generation_jobs_project_id ON public.generation_jobs(project_id);
CREATE INDEX idx_generations_project_id ON public.generations(project_id);
