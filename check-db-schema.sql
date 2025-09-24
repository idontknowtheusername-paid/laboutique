-- Script pour vérifier la structure de la base de données
-- Exécuter ces requêtes dans Supabase SQL Editor

-- 1. Vérifier la structure de la table products
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 2. Vérifier la structure de la table vendors
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'vendors' 
ORDER BY ordinal_position;

-- 3. Vérifier les contraintes de la table vendors
SELECT constraint_name, constraint_type, column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'vendors';

-- 4. Vérifier s'il existe des vendeurs
SELECT id, name, slug, email, status, created_at
FROM vendors 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Vérifier les catégories disponibles
SELECT id, name, slug, status
FROM categories 
WHERE status = 'active'
ORDER BY name;

-- 6. Vérifier les politiques RLS sur products
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'products';

-- 7. Vérifier les politiques RLS sur vendors
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'vendors';