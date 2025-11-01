-- Script pour corriger les politiques RLS qui bloquent l'accès au panier

-- ========================================
-- CART_ITEMS - Corriger les politiques
-- ========================================

-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can manage own cart items" ON cart_items;

-- Créer des politiques plus permissives
CREATE POLICY "Users can manage own cart items"
ON cart_items FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ========================================
-- PROFILES - Corriger les politiques
-- ========================================

-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;

-- Créer des politiques plus permissives
CREATE POLICY "Users can manage own profile"
ON profiles FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ========================================
-- WISHLIST - Corriger les politiques
-- ========================================

-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Users can view own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can insert own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can delete own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlist;

-- Créer des politiques plus permissives
CREATE POLICY "Users can manage own wishlist"
ON wishlist FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ========================================
-- PRODUCTS, VENDORS, CATEGORIES - Politiques pour les jointures
-- ========================================

-- Les produits doivent être accessibles à tous pour les jointures
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
TO authenticated, anon
USING (status = 'active');

-- Les vendeurs doivent être accessibles à tous pour les jointures
DROP POLICY IF EXISTS "Vendors are viewable by everyone" ON vendors;
CREATE POLICY "Vendors are viewable by everyone"
ON vendors FOR SELECT
TO authenticated, anon
USING (status = 'active');

-- Les catégories doivent être accessibles à tous pour les jointures
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone"
ON categories FOR SELECT
TO authenticated, anon
USING (status = 'active');

-- ========================================
-- RPC FUNCTIONS - Politiques pour les fonctions
-- ========================================

-- Permettre l'accès aux fonctions RPC pour les utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION get_user_stats TO authenticated;

-- ========================================
-- VÉRIFICATIONS ET DIAGNOSTICS
-- ========================================

-- Vérifier la structure des tables
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('cart_items', 'profiles', 'wishlist') 
AND column_name LIKE '%user%'
ORDER BY table_name, column_name;

-- Vérifier que RLS est activé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('cart_items', 'profiles', 'wishlist');

-- Lister les politiques actuelles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('cart_items', 'profiles', 'wishlist', 'products', 'vendors', 'categories')
ORDER BY tablename, policyname;