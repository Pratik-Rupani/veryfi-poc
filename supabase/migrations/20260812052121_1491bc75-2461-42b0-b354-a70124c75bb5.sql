-- Remove fully public access policies on receipts
DROP POLICY IF EXISTS "Anyone can view receipts" ON public.receipts;
DROP POLICY IF EXISTS "Anyone can add receipts" ON public.receipts;
DROP POLICY IF EXISTS "Anyone can update receipts" ON public.receipts;
DROP POLICY IF EXISTS "Anyone can delete receipts" ON public.receipts;

-- Revoke direct Data API access from untrusted roles
REVOKE ALL ON public.receipts FROM anon;
REVOKE ALL ON public.receipts FROM authenticated;

-- Only the trusted server (service role) may access receipts
GRANT ALL ON public.receipts TO service_role;

ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts FORCE ROW LEVEL SECURITY;

-- Ensure the trusted server can still operate on the table under forced RLS
CREATE POLICY "Service role manages receipts"
ON public.receipts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);