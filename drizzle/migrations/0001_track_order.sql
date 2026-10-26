ALTER TABLE public.products ADD COLUMN in_stock boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.products.in_stock IS 'Admin-toggled availability; false = out of stock';

-- Public order tracking: anyone holding an order code can see its progress,
-- but only narrow fields (no customer name, phone, address).
CREATE OR REPLACE FUNCTION public.get_order_tracking(_code text)
RETURNS TABLE (
  order_code text,
  status text,
  items jsonb,
  total integer,
  created_at timestamptz,
  payment_confirmed_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.order_code, o.status, o.items, o.total, o.created_at, o.payment_confirmed_at
  FROM public.orders o
  WHERE o.order_code = _code
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.get_order_tracking(text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.get_order_tracking(text) FROM public;