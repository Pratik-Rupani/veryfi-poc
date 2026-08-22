CREATE TABLE public.receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_name TEXT,
  merchant_address TEXT,
  receipt_date DATE,
  subtotal NUMERIC(12,2),
  tax NUMERIC(12,2),
  tip NUMERIC(12,2),
  total NUMERIC(12,2),
  currency TEXT,
  payment_type TEXT,
  category TEXT,
  invoice_number TEXT,
  image_url TEXT,
  storage_path TEXT,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.receipts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.receipts TO authenticated;
GRANT ALL ON public.receipts TO service_role;

ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view receipts" ON public.receipts FOR SELECT USING (true);
CREATE POLICY "Anyone can add receipts" ON public.receipts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update receipts" ON public.receipts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete receipts" ON public.receipts FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_receipts_updated_at
BEFORE UPDATE ON public.receipts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX receipts_created_at_idx ON public.receipts (created_at DESC);