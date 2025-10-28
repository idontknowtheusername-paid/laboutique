-- Migration: Ajout des politiques RLS pour les tables principales
-- Date: 2025-10-28

-- Désactiver RLS temporairement pour configuration
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products can be managed by service role" ON products;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Categories can be managed by service role" ON categories;
DROP POLICY IF EXISTS "Vendors are viewable by everyone" ON vendors;
DROP POLICY IF EXISTS "Vendors can be managed by service role" ON vendors;

-- Activer RLS sur les tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Politiques pour PRODUCTS
-- Lecture publique pour les produits actifs
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
USING (true);

-- Toutes les opérations autorisées pour le service role (backend)
CREATE POLICY "Products can be managed by service role"
ON products FOR ALL
USING (true)
WITH CHECK (true);

-- Politiques pour CATEGORIES
-- Lecture publique
CREATE POLICY "Categories are viewable by everyone"
ON categories FOR SELECT
USING (true);

-- Toutes les opérations autorisées pour le service role
CREATE POLICY "Categories can be managed by service role"
ON categories FOR ALL
USING (true)
WITH CHECK (true);

-- Politiques pour VENDORS
-- Lecture publique
CREATE POLICY "Vendors are viewable by everyone"
ON vendors FOR SELECT
USING (true);

-- Toutes les opérations autorisées pour le service role
CREATE POLICY "Vendors can be managed by service role"
ON vendors FOR ALL
USING (true)
WITH CHECK (true);
