-- Script pour vérifier la structure de votre base de données
-- Exécuter ceci d'abord pour voir quelles tables existent

-- 1. Lister toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Voir la structure de la table products (si elle existe)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Voir la structure de la table categories (si elle existe)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Voir la structure de la table orders (si elle existe)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Voir la structure de la table cart_items (si elle existe)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
AND table_schema = 'public'
ORDER BY ordinal_position;