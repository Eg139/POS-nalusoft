export function generateSupabaseMigrationSQL(): string {
  return `-- SuperPOS - Esquema de Base de Datos Compatible con Supabase (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  barcode TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock NUMERIC(12,3) NOT NULL DEFAULT 0,
  min_stock_alert NUMERIC(12,3) NOT NULL DEFAULT 5,
  unit TEXT NOT NULL DEFAULT 'pz',
  tax_rate NUMERIC(5,4) NOT NULL DEFAULT 0,
  expiry_date DATE,
  manufacturing_date DATE,
  batch_number TEXT,
  is_icecream_presentation BOOLEAN DEFAULT FALSE,
  max_flavors INTEGER,
  total_grams INTEGER,
  is_raw_flavor BOOLEAN DEFAULT FALSE,
  is_supply BOOLEAN DEFAULT FALSE,
  has_recipe BOOLEAN DEFAULT FALSE,
  recipe JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales (
  id TEXT PRIMARY KEY,
  folio TEXT NOT NULL UNIQUE,
  cashier_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  cost_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_profit NUMERIC(12,2) NOT NULL DEFAULT 0,
  profit_margin NUMERIC(6,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  change NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  barcode TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity NUMERIC(12,3) NOT NULL,
  previous_stock NUMERIC(12,3) NOT NULL,
  new_stock NUMERIC(12,3) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movements_product_id ON public.stock_movements(product_id);
`;
}
