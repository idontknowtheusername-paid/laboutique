-- Script pour diagnostiquer et corriger les problèmes de vendeurs
-- Exécuter ces requêtes dans Supabase SQL Editor

-- 1. Vérifier la structure de la table vendors
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'vendors' 
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes de la table vendors
SELECT 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'vendors';

-- 3. Vérifier les politiques RLS sur vendors
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'vendors';

-- 4. Vérifier s'il existe des vendeurs
SELECT id, name, slug, email, status, created_at
FROM vendors 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Tenter de créer un vendeur de test (pour diagnostiquer l'erreur)
INSERT INTO vendors (
    name, 
    slug, 
    email, 
    status, 
    commission_rate, 
    rating, 
    total_reviews, 
    total_products, 
    total_orders
) VALUES (
    'Test Vendor', 
    'test-vendor-' || extract(epoch from now())::text, 
    'test@example.com', 
    'active', 
    10.00, 
    0, 
    0, 
    0, 
    0
) RETURNING id, name, slug;

-- 6. Si la création échoue, vérifier les colonnes manquantes
-- (Décommentez si nécessaire)

-- ALTER TABLE vendors ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 0.00;
-- ALTER TABLE vendors ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00;
-- ALTER TABLE vendors ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
-- ALTER TABLE vendors ADD COLUMN IF NOT EXISTS total_products INTEGER DEFAULT 0;
-- ALTER TABLE vendors ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;

-- 7. Vérifier les permissions sur la table vendors
SELECT 
    grantee, 
    privilege_type, 
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'vendors';

-- 8. Créer un vendeur par défaut si aucun n'existe
INSERT INTO vendors (
    name, 
    slug, 
    email, 
    status, 
    commission_rate, 
    rating, 
    total_reviews, 
    total_products, 
    total_orders
) 
SELECT 
    'La Boutique B Import', 
    'laboutique-import', 
    'import@laboutique.bj', 
    'active', 
    10.00, 
    0, 
    0, 
    0, 
    0
WHERE NOT EXISTS (
    SELECT 1 FROM vendors WHERE slug = 'laboutique-import'
) 
RETURNING id, name, slug;