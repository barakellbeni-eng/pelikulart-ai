
-- Cauris ledger table to track all credit movements
CREATE TABLE public.cauris_ledger (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'generation',
  description text NOT NULL DEFAULT '',
  amount integer NOT NULL DEFAULT 0,
  balance_after integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cauris_ledger ENABLE ROW LEVEL SECURITY;

-- Users can only view their own ledger entries
CREATE POLICY "Users can view own ledger" ON public.cauris_ledger
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Deny direct inserts from clients (only edge functions via service role)
CREATE POLICY "Deny client inserts on ledger" ON public.cauris_ledger
  FOR INSERT TO authenticated
  WITH CHECK (false);

-- Deny updates
CREATE POLICY "Deny updates on ledger" ON public.cauris_ledger
  FOR UPDATE TO authenticated
  USING (false);

-- Deny deletes
CREATE POLICY "Deny deletes on ledger" ON public.cauris_ledger
  FOR DELETE TO authenticated
  USING (false);

-- Index for fast user lookups
CREATE INDEX idx_cauris_ledger_user_id ON public.cauris_ledger(user_id, created_at DESC);
