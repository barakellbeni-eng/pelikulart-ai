
-- 1. Fix waitlist INSERT policy: replace WITH CHECK(true) with email validation
DROP POLICY IF EXISTS "Anyone can insert into waitlist" ON public.waitlist;
CREATE POLICY "Anyone can insert into waitlist"
  ON public.waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (length(email) > 0 AND length(email) <= 255);

-- 2. Add explicit restrictive SELECT denial on waitlist
CREATE POLICY "Deny all reads on waitlist"
  ON public.waitlist FOR SELECT
  TO anon, authenticated
  USING (false);

-- 3. Fix payment_transactions SELECT: scope to authenticated only
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.payment_transactions;
CREATE POLICY "Users can view their own transactions"
  ON public.payment_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
