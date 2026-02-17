
-- Atomic function to deduct cauris (credits) from a user's profile
-- Returns the new balance, or -1 if insufficient funds
CREATE OR REPLACE FUNCTION public.deduct_cauris(p_user_id UUID, p_amount INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_balance INT;
BEGIN
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
$$;

-- Function to add cauris after payment
CREATE OR REPLACE FUNCTION public.add_cauris(p_user_id UUID, p_amount INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_balance INT;
BEGIN
  UPDATE profiles SET credits = credits + p_amount, updated_at = now() WHERE user_id = p_user_id
  RETURNING credits INTO new_balance;
  
  RETURN COALESCE(new_balance, 0);
END;
$$;
