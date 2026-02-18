
-- Drop the restrictive SELECT policies
DROP POLICY "Anyone can view public generations" ON public.generations;
DROP POLICY "Users can view their own generations" ON public.generations;

-- Recreate as PERMISSIVE (default) so either condition is sufficient
CREATE POLICY "Anyone can view public generations"
ON public.generations FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can view their own generations"
ON public.generations FOR SELECT
USING (auth.uid() = user_id);
