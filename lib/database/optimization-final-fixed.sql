-- Optimisations de base de données pour la scalabilité (VERSION FINALE CORRIGÉE)
-- Adapté à votre structure réelle de base de données
-- À exécuter dans Supabase SQL Editor

-- 1. INDEX POUR PERFORMANCE - PRODUITS
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- 2. INDEX POUR PERFORMANCE - CATÉGORIES
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- 3. INDEX POUR PERFORMANCE - COMMANDES
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- 4. INDEX POUR PERFORMANCE - PANIER
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- 5. INDEX POUR PERFORMANCE - PROFILS (CORRIGÉ)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);

-- 6. INDEX COMPOSITES POUR REQUÊTES COMPLEXES
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products(category_id, price);
CREATE INDEX IF NOT EXISTS idx_products_status_featured ON products(status, featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at);

-- 7. INDEX POUR RECHERCHE FULL-TEXT
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('french', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(short_description, '')));
CREATE INDEX IF NOT EXISTS idx_categories_search ON categories USING gin(to_tsvector('french', name || ' ' || COALESCE(description, '')));

-- 8. VUES MATÉRIALISÉES POUR PERFORMANCE
-- Vue pour les produits populaires
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_products AS
SELECT 
    p.id,
    p.name,
    p.price,
    p.images,
    p.category_id,
    p.vendor_id,
    p.brand,
    COUNT(oi.id) as order_count,
    SUM(oi.quantity) as total_quantity,
    AVG(pr.rating) as avg_rating,
    COUNT(pr.id) as review_count
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN product_reviews pr ON p.id = pr.product_id
WHERE p.created_at >= NOW() - INTERVAL '30 days'
  AND p.status = 'active'
GROUP BY p.id, p.name, p.price, p.images, p.category_id, p.vendor_id, p.brand
ORDER BY order_count DESC, avg_rating DESC
LIMIT 100;

-- Vue pour les statistiques des catégories
CREATE MATERIALIZED VIEW IF NOT EXISTS category_stats AS
SELECT 
    c.id,
    c.name,
    c.slug,
    c.image_url,
    COUNT(p.id) as product_count,
    AVG(p.price) as avg_price,
    MIN(p.price) as min_price,
    MAX(p.price) as max_price,
    COUNT(CASE WHEN p.featured = true THEN 1 END) as featured_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
GROUP BY c.id, c.name, c.slug, c.image_url;

-- Vue pour les statistiques des commandes
CREATE MATERIALIZED VIEW IF NOT EXISTS order_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as order_date,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY order_date DESC;

-- 9. FONCTIONS POUR REQUÊTES OPTIMISÉES
-- Fonction pour rechercher des produits avec pagination
CREATE OR REPLACE FUNCTION search_products(
    search_term TEXT DEFAULT '',
    category_id UUID DEFAULT NULL,
    vendor_id UUID DEFAULT NULL,
    min_price DECIMAL DEFAULT NULL,
    max_price DECIMAL DEFAULT NULL,
    status_filter TEXT DEFAULT 'active',
    sort_by TEXT DEFAULT 'created_at',
    sort_order TEXT DEFAULT 'DESC',
    page_size INTEGER DEFAULT 20,
    page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    price DECIMAL,
    images TEXT[],
    category_id UUID,
    vendor_id UUID,
    brand TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_products AS (
        SELECT p.*, COUNT(*) OVER() as total_count
        FROM products p
        WHERE 
            (search_term = '' OR to_tsvector('french', p.name || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(p.short_description, '')) @@ plainto_tsquery('french', search_term))
            AND (category_id IS NULL OR p.category_id = category_id)
            AND (vendor_id IS NULL OR p.vendor_id = vendor_id)
            AND (min_price IS NULL OR p.price >= min_price)
            AND (max_price IS NULL OR p.price <= max_price)
            AND (status_filter = '' OR p.status = status_filter)
        ORDER BY 
            CASE WHEN sort_by = 'price' AND sort_order = 'ASC' THEN p.price END ASC,
            CASE WHEN sort_by = 'price' AND sort_order = 'DESC' THEN p.price END DESC,
            CASE WHEN sort_by = 'name' AND sort_order = 'ASC' THEN p.name END ASC,
            CASE WHEN sort_by = 'name' AND sort_order = 'DESC' THEN p.name END DESC,
            CASE WHEN sort_by = 'created_at' AND sort_order = 'ASC' THEN p.created_at END ASC,
            CASE WHEN sort_by = 'created_at' AND sort_order = 'DESC' THEN p.created_at END DESC
        LIMIT page_size OFFSET page_offset
    )
    SELECT 
        fp.id,
        fp.name,
        fp.description,
        fp.price,
        fp.images,
        fp.category_id,
        fp.vendor_id,
        fp.brand,
        fp.created_at,
        fp.total_count
    FROM filtered_products fp;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les statistiques d'un produit
CREATE OR REPLACE FUNCTION get_product_stats(product_id UUID)
RETURNS TABLE (
    total_orders BIGINT,
    total_quantity BIGINT,
    avg_rating DECIMAL,
    review_count BIGINT,
    last_order_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT oi.order_id) as total_orders,
        COALESCE(SUM(oi.quantity), 0) as total_quantity,
        COALESCE(AVG(pr.rating), 0) as avg_rating,
        COUNT(pr.id) as review_count,
        MAX(o.created_at) as last_order_date
    FROM products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id
    LEFT JOIN product_reviews pr ON p.id = pr.product_id
    WHERE p.id = product_id
    GROUP BY p.id;
END;
$$ LANGUAGE plpgsql;

-- 10. POLITIQUES RLS OPTIMISÉES
-- Activer RLS sur toutes les tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Politiques pour les produits (lecture publique)
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

-- Politiques pour les catégories (lecture publique)
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

-- Politiques pour les commandes (utilisateur propriétaire)
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour le panier (utilisateur propriétaire)
CREATE POLICY "Users can manage own cart" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- Politiques pour les profils (utilisateur propriétaire) - CORRIGÉ
CREATE POLICY "Users can manage own profile" ON profiles
    FOR ALL USING (auth.uid() = id);

-- Politiques pour les adresses (utilisateur propriétaire)
CREATE POLICY "Users can manage own addresses" ON addresses
    FOR ALL USING (auth.uid() = user_id);

-- Politiques pour les méthodes de paiement (utilisateur propriétaire)
CREATE POLICY "Users can manage own payment methods" ON payment_methods
    FOR ALL USING (auth.uid() = user_id);

-- Politiques pour la wishlist (utilisateur propriétaire)
CREATE POLICY "Users can manage own wishlist" ON wishlist
    FOR ALL USING (auth.uid() = user_id);

-- 11. CONFIGURATION POUR PERFORMANCE
-- Augmenter les limites de connexion
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- 12. NETTOYAGE AUTOMATIQUE
-- Fonction pour nettoyer les données anciennes
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Supprimer les sessions expirées
    DELETE FROM auth.sessions 
    WHERE expires_at < NOW() - INTERVAL '30 days';
    
    -- Nettoyer les logs anciens (si la table existe)
    DELETE FROM logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- 13. RÉFRESHER LES VUES MATÉRIALISÉES
REFRESH MATERIALIZED VIEW popular_products;
REFRESH MATERIALIZED VIEW category_stats;
REFRESH MATERIALIZED VIEW order_stats;

-- 14. STATISTIQUES POUR L'OPTIMISEUR
ANALYZE products;
ANALYZE categories;
ANALYZE orders;
ANALYZE cart_items;
ANALYZE profiles;