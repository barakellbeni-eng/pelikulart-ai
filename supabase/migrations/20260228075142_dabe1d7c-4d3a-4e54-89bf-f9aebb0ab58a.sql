
-- 1. Block ALL client-side INSERT on payment_transactions (only edge functions with service role can insert)
CREATE POLICY "Deny all inserts on payment_transactions"
ON public.payment_transactions
FOR INSERT
TO authenticated
WITH CHECK (false);

-- 2. Block UPDATE on payment_transactions (immutable records)
CREATE POLICY "Deny all updates on payment_transactions"
ON public.payment_transactions
FOR UPDATE
TO authenticated
USING (false);

-- 3. Block DELETE on payment_transactions (immutable records)
CREATE POLICY "Deny all deletes on payment_transactions"
ON public.payment_transactions
FOR DELETE
TO authenticated
USING (false);

-- 4. Block DELETE on profiles (prevent profile deletion)
CREATE POLICY "Deny profile deletion"
ON public.profiles
FOR DELETE
TO authenticated
USING (false);
