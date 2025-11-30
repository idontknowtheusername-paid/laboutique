-- =====================================================
-- NETTOYAGE DES DESCRIPTIONS DE PRODUITS
-- Supprime les informations techniques d'import qui ne doivent pas être visibles
-- =====================================================

-- 1. Nettoyer les descriptions longues
UPDATE products 
SET description = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      description,
      'Produit importé depuis AliExpress.*?API\.', 
      '', 
      'gi'
    ),
    'Caractéristiques:\s*-\s*Note:.*?-\s*Ventes récentes:.*?[0-9]+',
    '',
    'gi'
  ),
  '\n\s*\n\s*\n',
  E'\n\n',
  'g'
)
WHERE description LIKE '%AliExpress%' 
   OR description LIKE '%Caractéristiques:%'
   OR description LIKE '%Note:%';

-- 2. Nettoyer les descriptions courtes
UPDATE products 
SET short_description = REGEXP_REPLACE(
  REGEXP_REPLACE(
    short_description,
    'Produit importé depuis AliExpress.*?API\.', 
    '', 
    'gi'
  ),
  'Note:.*?[0-9]+\.?[0-9]*',
  '',
  'gi'
)
WHERE short_description LIKE '%AliExpress%' 
   OR short_description LIKE '%Note:%';

-- 3. Supprimer les espaces en trop
UPDATE products 
SET description = TRIM(description)
WHERE description IS NOT NULL;

UPDATE products 
SET short_description = TRIM(short_description)
WHERE short_description IS NOT NULL;

-- 4. Vérifier les résultats
SELECT 
  id,
  name,
  LEFT(description, 100) as description_preview,
  LEFT(short_description, 100) as short_description_preview
FROM products
WHERE description IS NOT NULL
ORDER BY updated_at DESC
LIMIT 20;

-- 5. Statistiques de nettoyage
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN description LIKE '%AliExpress%' THEN 1 END) as still_has_aliexpress,
  COUNT(CASE WHEN description LIKE '%Caractéristiques:%' THEN 1 END) as still_has_features,
  COUNT(CASE WHEN description IS NULL OR description = '' THEN 1 END) as empty_descriptions
FROM products;
