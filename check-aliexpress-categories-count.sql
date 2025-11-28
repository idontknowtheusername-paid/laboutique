-- Vérifier les catégories AliExpress chargées
SELECT 
  COUNT(*) as total_categories,
  COUNT(CASE WHEN parent_category_id IS NULL THEN 1 END) as top_level_categories,
  COUNT(CASE WHEN parent_category_id IS NOT NULL THEN 1 END) as child_categories
FROM aliexpress_categories;

-- Afficher quelques exemples
SELECT 
  category_id,
  category_name,
  parent_category_id,
  has_children
FROM aliexpress_categories
WHERE parent_category_id IS NULL
ORDER BY category_name
LIMIT 20;
