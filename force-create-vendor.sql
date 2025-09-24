-- Script pour forcer la création d'un vendeur par défaut
-- Exécuter dans Supabase SQL Editor

-- 1. Vérifier les vendeurs existants
SELECT id, name, slug, email, status, created_at FROM vendors ORDER BY created_at DESC;

-- 2. Créer un vendeur par défaut (forcer l'insertion)
INSERT INTO vendors (
    name, 
    slug, 
    email, 
    status
) VALUES (
    'Vendeur par défaut', 
    'vendeur-defaut', 
    'default@laboutique.bj', 
    'active'
) ON CONFLICT (slug) DO NOTHING
RETURNING id, name, slug, email, status;

-- 3. Vérifier le résultat
SELECT id, name, slug, email, status, created_at FROM vendors ORDER BY created_at DESC LIMIT 5;

-- 4. Si toujours des problèmes, vérifier les contraintes
SELECT 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'vendors' AND tc.constraint_type = 'UNIQUE';