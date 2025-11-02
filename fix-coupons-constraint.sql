-- Corriger la contrainte de type pour les coupons
-- Supprimer l'ancienne contrainte
ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_type_check;

-- Ajouter la nouvelle contrainte avec 'free_shipping'
ALTER TABLE coupons ADD CONSTRAINT coupons_type_check 
CHECK (type IN ('percentage', 'fixed', 'free_shipping'));

-- Vérifier que la contrainte est bien appliquée
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'coupons'::regclass 
AND conname = 'coupons_type_check';