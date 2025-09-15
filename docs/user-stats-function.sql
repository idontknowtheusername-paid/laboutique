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