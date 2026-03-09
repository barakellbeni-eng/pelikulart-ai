
-- Add stats columns to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS generation_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS cauris_spent integer NOT NULL DEFAULT 0;

-- Update handle_new_user to use 'Sans titre'
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));

  INSERT INTO public.projects (user_id, name)
  VALUES (NEW.id, 'Sans titre');

  RETURN NEW;
END;
$$;

-- Helper function to increment project stats after a generation
CREATE OR REPLACE FUNCTION public.increment_project_stats(p_project_id uuid, p_cauris integer)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  IF p_project_id IS NULL THEN RETURN; END IF;
  UPDATE public.projects
  SET generation_count = generation_count + 1,
      cauris_spent = cauris_spent + p_cauris,
      updated_at = now()
  WHERE id = p_project_id;
END;
$$;
