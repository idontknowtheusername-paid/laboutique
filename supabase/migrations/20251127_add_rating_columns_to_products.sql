-- Migration: Add rating columns to products table
-- Date: 2025-11-27
-- Description: Add average_rating and reviews_count columns to products table for reviews system

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
