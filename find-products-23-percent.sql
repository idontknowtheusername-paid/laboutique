-- Requête pour identifier les produits avec un badge de réduction de -23%
-- Le badge est calculé comme : ROUND(((compare_price - price) / compare_price) * 100)

SELECT 
  id,
  name,
  slug,
  price,
  compare_price,
  ROUND(((compare_price - price) / compare_price) * 100) as discount_percentage,
  status,
  created_at
FROM products
WHERE 
  compare_price IS NOT NULL 
  AND compare_price > 0
  AND price < compare_price
  AND ROUND(((compare_price - price) / compare_price) * 100) = 23
ORDER BY created_at DESC;

-- Variante : produits avec réduction entre 22% et 24% (pour capturer les arrondis)
-- SELECT 
--   id,
--   name,
--   slug,
--   price,
--   compare_price,
--   ROUND(((compare_price - price) / compare_price) * 100) as discount_percentage,
--   status,
--   created_at
-- FROM products
-- WHERE 
--   compare_price IS NOT NULL 
--   AND compare_price > 0
--   AND price < compare_price
--   AND ROUND(((compare_price - price) / compare_price) * 100) BETWEEN 22 AND 24
-- ORDER BY discount_percentage, created_at DESC;
