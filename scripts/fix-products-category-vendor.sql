-- Correction des produits sans catégorie ou vendeur
-- Remplacez les UUID ci-dessous par ceux de votre base si besoin

UPDATE products
SET category_id = 'c1011f0a-a196-4678-934a-85ae8b9cff35'
WHERE category_id IS NULL;

UPDATE products
SET vendor_id = '8f1010fb-e4e1-448a-bb4b-8d320a2aa9e6'
WHERE vendor_id IS NULL;
