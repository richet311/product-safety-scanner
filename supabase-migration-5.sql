-- =============================================
-- Surfelt — Migration 5: Product Cache
-- Paste into: Supabase Dashboard → SQL Editor → New query
-- Safe to re-run (uses IF NOT EXISTS / ON CONFLICT)
-- =============================================


-- ─────────────────────────────────────────────
-- 1. Add barcode column to existing scans table
-- ─────────────────────────────────────────────
ALTER TABLE public.scans
  ADD COLUMN IF NOT EXISTS barcode TEXT;

CREATE INDEX IF NOT EXISTS scans_barcode_idx
  ON public.scans (barcode)
  WHERE barcode IS NOT NULL;


-- ─────────────────────────────────────────────
-- 2. Shared product ingredient cache
--    No PII — stores product name + ingredients
--    only. Readable by all authenticated users.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_cache (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode           TEXT        UNIQUE,
  product_name      TEXT        NOT NULL,
  raw_ingredients   TEXT        NOT NULL,
  product_image_url TEXT,
  source            TEXT        NOT NULL DEFAULT 'scan',
  hit_count         INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast case-insensitive product name lookup
CREATE INDEX IF NOT EXISTS product_cache_name_lower_idx
  ON public.product_cache (lower(product_name));


-- ─────────────────────────────────────────────
-- 3. Row-level security
-- ─────────────────────────────────────────────
ALTER TABLE public.product_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_cache: authenticated read"   ON public.product_cache;
DROP POLICY IF EXISTS "product_cache: authenticated insert" ON public.product_cache;
DROP POLICY IF EXISTS "product_cache: authenticated update" ON public.product_cache;

CREATE POLICY "product_cache: authenticated read"
  ON public.product_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "product_cache: authenticated insert"
  ON public.product_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "product_cache: authenticated update"
  ON public.product_cache FOR UPDATE
  TO authenticated
  USING (true);


-- ─────────────────────────────────────────────
-- 4. Auto-update updated_at on changes
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS product_cache_set_updated_at ON public.product_cache;
CREATE TRIGGER product_cache_set_updated_at
  BEFORE UPDATE ON public.product_cache
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────
-- 5. Backfill: seed cache from existing scans
--    Uses most recent scan per product name.
--    Existing scans have no barcode column yet
--    so all backfilled rows are name-keyed only.
-- ─────────────────────────────────────────────
INSERT INTO public.product_cache (product_name, raw_ingredients, source)
SELECT product_name, raw_ingredients, 'backfill'
FROM (
  SELECT DISTINCT ON (lower(product_name))
    product_name,
    raw_ingredients
  FROM public.scans
  WHERE product_name   IS NOT NULL
    AND raw_ingredients IS NOT NULL
    AND raw_ingredients <> ''
  ORDER BY lower(product_name), created_at DESC
) sub;
