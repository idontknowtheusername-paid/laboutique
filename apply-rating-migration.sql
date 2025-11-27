-- Script pour appliquer la migration des colonnes de rating
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- =============================================
-- 1. ADD COLUMNS TO PRODUCTS TABLE
-- =============================================
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0);

-- =============================================
-- 2. CREATE INDEX FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_products_average_rating ON public.products(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_reviews_count ON public.products(reviews_count DESC);

-- =============================================
-- 3. UPDATE EXISTING PRODUCTS WITH CURRENT RATINGS
-- =============================================
-- Calculate and update average_rating and reviews_count for existing products that have reviews
UPDATE public.products p
SET 
  average_rating = COALESCE((
    SELECT AVG(rating)::DECIMAL(3,2)
    FROM public.reviews r
    WHERE r.product_id = p.id
  ), 0),
  reviews_count = COALESCE((
    SELECT COUNT(*)::INTEGER
    FROM public.reviews r
    WHERE r.product_id = p.id
  ), 0)
WHERE EXISTS (
  SELECT 1 FROM public.reviews r WHERE r.product_id = p.id
);

-- =============================================
-- 4. COMMENTS
-- =============================================
COMMENT ON COLUMN public.products.average_rating IS 'Average rating from reviews (0-5)';
COMMENT ON COLUMN public.products.reviews_count IS 'Total number of reviews for this product';

-- =============================================
-- 5. VERIFY THE CHANGES
-- =============================================
-- Check if columns were added successfully
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'products' 
  AND column_name IN ('average_rating', 'reviews_count')
ORDER BY column_name;

-- Check if indexes were created
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE tablename = 'products' 
  AND indexname IN ('idx_products_average_rating', 'idx_products_reviews_count');

-- Show sample of products with ratings
SELECT 
  id,
  name,
  average_rating,
  reviews_count
FROM public.products
WHERE reviews_count > 0
LIMIT 10;
