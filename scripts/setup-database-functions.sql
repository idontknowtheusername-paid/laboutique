-- Setup script for database functions
-- Run this in your Supabase SQL editor

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'totalOrders', COALESCE(orders_count, 0),
    'totalSpent', COALESCE(total_spent, 0),
    'wishlistItems', COALESCE(wishlist_count, 0),
    'cartItems', COALESCE(cart_count, 0),
    'reviewsCount', COALESCE(reviews_count, 0)
  ) INTO result
  FROM (
    SELECT 
      (SELECT COUNT(*) FROM orders WHERE orders.user_id = get_user_stats.user_id) as orders_count,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE orders.user_id = get_user_stats.user_id AND status = 'delivered') as total_spent,
      (SELECT COUNT(*) FROM wishlist WHERE wishlist.user_id = get_user_stats.user_id) as wishlist_count,
      (SELECT COALESCE(SUM(quantity), 0) FROM cart_items WHERE cart_items.user_id = get_user_stats.user_id) as cart_count,
      (SELECT COUNT(*) FROM product_reviews WHERE product_reviews.user_id = get_user_stats.user_id) as reviews_count
  ) stats;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get product review stats
CREATE OR REPLACE FUNCTION get_product_review_stats(product_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_reviews', COALESCE(total_count, 0),
    'average_rating', COALESCE(avg_rating, 0),
    'rating_distribution', json_build_object(
      '5', COALESCE(rating_5, 0),
      '4', COALESCE(rating_4, 0),
      '3', COALESCE(rating_3, 0),
      '2', COALESCE(rating_2, 0),
      '1', COALESCE(rating_1, 0)
    )
  ) INTO result
  FROM (
    SELECT 
      COUNT(*) as total_count,
      ROUND(AVG(rating::numeric), 2) as avg_rating,
      COUNT(*) FILTER (WHERE rating = 5) as rating_5,
      COUNT(*) FILTER (WHERE rating = 4) as rating_4,
      COUNT(*) FILTER (WHERE rating = 3) as rating_3,
      COUNT(*) FILTER (WHERE rating = 2) as rating_2,
      COUNT(*) FILTER (WHERE rating = 1) as rating_1
    FROM product_reviews 
    WHERE product_reviews.product_id = get_product_review_stats.product_id 
      AND status = 'approved'
  ) stats;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment review helpful count
CREATE OR REPLACE FUNCTION increment_review_helpful(review_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE product_reviews 
  SET helpful_count = helpful_count + 1,
      updated_at = now()
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS policies (if not already enabled)
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_reviews ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for user stats function
DO $$
BEGIN
  -- Policy for orders
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'orders' 
    AND policyname = 'Users can view own orders'
  ) THEN
    CREATE POLICY "Users can view own orders" ON orders
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Policy for wishlist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'wishlist' 
    AND policyname = 'Users can view own wishlist'
  ) THEN
    CREATE POLICY "Users can view own wishlist" ON wishlist
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Policy for cart_items
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cart_items' 
    AND policyname = 'Users can view own cart'
  ) THEN
    CREATE POLICY "Users can view own cart" ON cart_items
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Policy for product_reviews
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'product_reviews' 
    AND policyname = 'Users can view own reviews'
  ) THEN
    CREATE POLICY "Users can view own reviews" ON product_reviews
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END
$$;