-- Fix security warnings by setting search_path on functions

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix generate_invoice_number function
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  year_prefix TEXT;
  next_num INTEGER;
BEGIN
  year_prefix := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-';
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.invoices
  WHERE invoice_number LIKE year_prefix || '%';
  NEW.invoice_number := year_prefix || LPAD(next_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

-- Fix generate_transaction_id function
CREATE OR REPLACE FUNCTION public.generate_transaction_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.transaction_id := 'TXN' || TO_CHAR(now(), 'YYYYMMDDHH24MISS') || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
  RETURN NEW;
END;
$$;