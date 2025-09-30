-- Optimisations de base de données pour la scalabilité
-- À exécuter dans Supabase SQL Editor

-- 1. INDEX POUR PERFORMANCE
-- Index sur les colonnes fréquemment utilisées
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_popularity ON products(popularity_score);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- 2. INDEX COMPOSITES POUR REQUÊTES COMPLEXES
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products(category_id, price);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('french', name || ' ' || description));

-- 3. VUES MATÉRIALISÉES POUR PERFORMANCE
-- Vue pour les statistiques des produits populaires
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_products AS
SELECT 
    p.id,
    p.name,
    p.price,
    p.image_url,
    p.category_id,
    COUNT(oi.id) as order_count,
    SUM(oi.quantity) as total_quantity,
    AVG(r.rating) as avg_rating,
    COUNT(r.id) as review_count
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN reviews r ON p.id = r.product_id
WHERE p.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name, p.price, p.image_url, p.category_id
ORDER BY order_count DESC, avg_rating DESC
LIMIT 100;

-- Vue pour les statistiques des catégories
CREATE MATERIALIZED VIEW IF NOT EXISTS category_stats AS
SELECT 
    c.id,
    c.name,
    c.slug,
    COUNT(p.id) as product_count,
    AVG(p.price) as avg_price,
    MIN(p.price) as min_price,
    MAX(p.price) as max_price
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name, c.slug;

-- 4. FONCTIONS POUR REQUÊTES OPTIMISÉES
-- Fonction pour rechercher des produits avec pagination
CREATE OR REPLACE FUNCTION search_products(
    search_term TEXT DEFAULT '',
    category_id UUID DEFAULT NULL,
    min_price DECIMAL DEFAULT NULL,
    max_price DECIMAL DEFAULT NULL,
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
    image_url TEXT,
    category_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_products AS (
        SELECT p.*, COUNT(*) OVER() as total_count
        FROM products p
        WHERE 
            (search_term = '' OR to_tsvector('french', p.name || ' ' || p.description) @@ plainto_tsquery('french', search_term))
            AND (category_id IS NULL OR p.category_id = category_id)
            AND (min_price IS NULL OR p.price >= min_price)
            AND (max_price IS NULL OR p.price <= max_price)
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
        fp.image_url,
        fp.category_id,
        fp.created_at,
        fp.total_count
    FROM filtered_products fp;
END;
$$ LANGUAGE plpgsql;

-- 5. TRIGGERS POUR MAINTENIR LES STATISTIQUES
-- Trigger pour mettre à jour les vues matérialisées
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY popular_products;
    REFRESH MATERIALIZED VIEW CONCURRENTLY category_stats;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 6. POLITIQUES RLS OPTIMISÉES
-- Activer RLS sur toutes les tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Politiques pour les produits (lecture publique)
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

-- Politiques pour les commandes (utilisateur propriétaire)
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour le panier (utilisateur propriétaire)
CREATE POLICY "Users can manage own cart" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- 7. CONFIGURATION POUR PERFORMANCE
-- Augmenter les limites de connexion
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- 8. NETTOYAGE AUTOMATIQUE
-- Fonction pour nettoyer les données anciennes
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Supprimer les sessions expirées
    DELETE FROM auth.sessions 
    WHERE expires_at < NOW() - INTERVAL '30 days';
    
    -- Supprimer les logs anciens
    DELETE FROM logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Archiver les commandes anciennes
    INSERT INTO orders_archive 
    SELECT * FROM orders 
    WHERE created_at < NOW() - INTERVAL '2 years';
    
    DELETE FROM orders 
    WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Programmer le nettoyage automatique
SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_data();');