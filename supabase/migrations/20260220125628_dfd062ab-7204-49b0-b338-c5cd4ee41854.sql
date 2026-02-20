
-- Fix deduct_cauris: validate that caller can only deduct from their own account
CREATE OR REPLACE FUNCTION public.deduct_cauris(p_user_id uuid, p_amount integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_balance INT;
BEGIN
  -- Ensure user can only deduct from their own account
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot modify other users credits';
  END IF;

  SELECT credits INTO current_balance FROM profiles WHERE user_id = p_user_id FOR UPDATE;
  
  IF current_balance IS NULL THEN
    RETURN -1;
  END IF;
  
  IF current_balance < p_amount THEN
    RETURN -1;
  END IF;
  
  UPDATE profiles SET credits = credits - p_amount, updated_at = now() WHERE user_id = p_user_id;
  
  RETURN current_balance - p_amount;
END;
$function$;

-- Fix add_cauris: validate that caller can only add to their own account
CREATE OR REPLACE FUNCTION public.add_cauris(p_user_id uuid, p_amount integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_balance INT;
BEGIN
  -- Ensure user can only add to their own account
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot modify other users credits';
  END IF;

  UPDATE profiles SET credits = credits + p_amount, updated_at = now() WHERE user_id = p_user_id
  RETURNING credits INTO new_balance;
  
  RETURN COALESCE(new_balance, 0);
END;
$function$;
