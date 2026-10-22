-- Fruitful Seedlings store schema
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price integer NOT NULL CHECK (price >= 0),
  fruiting text NOT NULL,
  image text NOT NULL,
  sort integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  phone text NOT NULL,
  state text NOT NULL,
  address text NOT NULL,
  items jsonb NOT NULL,
  total integer NOT NULL CHECK (total >= 0),
  status text NOT NULL DEFAULT 'pending_payment',
  admin_note text NOT NULL DEFAULT '',
  payment_confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.store_settings (
  id text PRIMARY KEY DEFAULT 'default',
  business_name text NOT NULL DEFAULT 'Fruitful Seedlings',
  bank_name text NOT NULL DEFAULT '',
  account_number text NOT NULL DEFAULT '',
  account_name text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.store_settings (id) VALUES ('default');

-- Products
INSERT INTO public.products (name, category, price, fruiting, image, sort) VALUES
  ('Sweet Sapphire', 'Grapes', 20000, '~1 year', '/images/products/sweet-sapphire.jpg', 10),
  ('Crimson Seedless', 'Grapes', 10000, '~1 year', '/images/products/red-grapes.jpg', 20),
  ('Black Hamburg', 'Grapes', 7000, '~1 year', '/images/products/purple-grapes.jpg', 30),
  ('Purple Grape', 'Grapes', 8000, '~1 year', '/images/products/purple-grapes.jpg', 40),
  ('Black Currant', 'Grapes', 10000, '~1 year', '/images/products/purple-grapes.jpg', 50),
  ('Thomson Seedless', 'Grapes', 20000, '~1 year', '/images/products/green-grapes.jpg', 60),
  ('Red Globe', 'Grapes', 15000, '~1 year', '/images/products/red-grapes.jpg', 70),
  ('Apple (Standard)', 'Fruits', 20000, '~1-2+ years', '/images/products/apple.jpg', 110),
  ('Apple (Medium)', 'Fruits', 30000, '~1-2+ years', '/images/products/apple.jpg', 120),
  ('Apple (Premium)', 'Fruits', 60000, '~1-2+ years', '/images/products/apple.jpg', 130),
  ('Dwarf Mango', 'Fruits', 7000, '~8-10 months', '/images/products/mango.jpg', 140),
  ('Hass Avocado', 'Fruits', 5000, '~2-3 years', '/images/products/avocado.jpg', 150),
  ('Dwarf Coconut', 'Fruits', 15000, '~3-5+ years', '/images/products/coconut.jpg', 160),
  ('Star Fruit', 'Fruits', 7000, '~1 year', '/images/products/fruit-sapling.jpg', 170),
  ('Pomegranate', 'Fruits', 7000, '~6-7 months', '/images/products/pomegranate.jpg', 180),
  ('Plantain', 'Fruits', 5000, '~8-9 months', '/images/products/banana.jpg', 190),
  ('Banana', 'Fruits', 5000, '~8-10 months', '/images/products/banana.jpg', 200),
  ('Dragon Fruit', 'Fruits', 15000, '~1 year', '/images/products/dragon-fruit.jpg', 210),
  ('English Pear', 'Fruits', 60000, '~2+ years', '/images/products/apple.jpg', 220),
  ('Strawberry', 'Fruits', 3500, '~4-6 months', '/images/products/strawberry.jpg', 230),
  ('Fig', 'Fruits', 8000, '~5-6 months', '/images/products/fruit-sapling.jpg', 240),
  ('Jumbo Guava', 'Fruits', 5000, '~1 year', '/images/products/guava.jpg', 250),
  ('Custard Apple', 'Fruits', 5000, '~1-2 years', '/images/products/soursop.jpg', 260),
  ('Cherry Guava', 'Fruits', 45000, '~1 year+', '/images/products/guava.jpg', 270),
  ('Cashew', 'Fruits', 6000, '~1 year', '/images/products/fruit-sapling.jpg', 280),
  ('Soursop', 'Fruits', 5000, '~1 year', '/images/products/soursop.jpg', 290),
  ('Blood Orange', 'Fruits', 20000, '~1 year+', '/images/products/citrus.jpg', 300),
  ('Kiwi', 'Fruits', 20000, '~2-4+ years', '/images/products/fruit-sapling.jpg', 310),
  ('Tangerine', 'Citrus', 5000, '~1 year', '/images/products/citrus.jpg', 410),
  ('Grapefruit', 'Citrus', 5000, '~1-2 years', '/images/products/citrus.jpg', 420),
  ('Lime', 'Citrus', 2500, '~1 year', '/images/products/citrus.jpg', 430),
  ('Mandarin', 'Citrus', 15000, '~1 year', '/images/products/citrus.jpg', 440),
  ('Washington', 'Citrus', 5000, '~1 year', '/images/products/citrus.jpg', 450),
  ('King Orange', 'Citrus', 5000, '~1 year', '/images/products/citrus.jpg', 460),
  ('Tangelo', 'Citrus', 5000, '~1 year', '/images/products/citrus.jpg', 470),
  ('Date Palm (Big)', 'Palms & Other Plants', 30000, '~3-5+ years', '/images/products/date-palm.jpg', 510),
  ('Date Palm (Small)', 'Palms & Other Plants', 9000, '~5-8+ years', '/images/products/date-palm.jpg', 520),
  ('Palm Kernel Tree', 'Palms & Other Plants', 6000, '~3-4 years', '/images/products/palm-sapling.jpg', 530),
  ('Moringa', 'Palms & Other Plants', 2500, '~6-12 months', '/images/products/palm-sapling.jpg', 540),
  ('Umbrella Tree', 'Palms & Other Plants', 5000, 'Ornamental', '/images/products/palm-sapling.jpg', 550),
  ('Maradona', 'Palms & Other Plants', 5000, 'Varies by variety', '/images/products/palm-sapling.jpg', 560),
  ('Pixie', 'Palms & Other Plants', 15000, 'Varies by variety', '/images/products/palm-sapling.jpg', 570),
  ('Crimino', 'Palms & Other Plants', 15000, 'Varies by variety', '/images/products/palm-sapling.jpg', 580),
  ('Blueberry', 'Premium', 200000, '~1-2+ years', '/images/products/blueberry.jpg', 610),
  ('English Plum', 'Premium', 50000, '~2+ years', '/images/products/fruit-sapling.jpg', 620);

GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT ALL ON public.store_settings TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can browse products" ON public.products FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Service can manage products" ON public.products FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can place an order" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Service manages orders" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can read store settings" ON public.store_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service manages store settings" ON public.store_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
