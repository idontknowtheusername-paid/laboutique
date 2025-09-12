-- Script pour insérer des données de test
-- À exécuter APRÈS supabase-setup.sql

-- Produits de test (avec des IDs fixes pour simplifier)
DO $$
DECLARE
    cat_electronique_id uuid;
    cat_mode_id uuid;
    vendor_tech_id uuid;
    vendor_fashion_id uuid;
BEGIN
    -- Récupérer les IDs des catégories et vendeurs
    SELECT id INTO cat_electronique_id FROM categories WHERE slug = 'electronique';
    SELECT id INTO cat_mode_id FROM categories WHERE slug = 'mode-beaute';
    SELECT id INTO vendor_tech_id FROM vendors WHERE slug = 'techstore-benin';
    SELECT id INTO vendor_fashion_id FROM vendors WHERE slug = 'fashion-plus';

    -- Insérer les produits si les catégories et vendeurs existent
    IF cat_electronique_id IS NOT NULL AND vendor_tech_id IS NOT NULL THEN
        INSERT INTO products (name, slug, sku, price, compare_price, description, short_description, category_id, vendor_id, status, featured, images) VALUES
        ('iPhone 15 Pro Max', 'iphone-15-pro-max', 'IPHONE15PM-001', 850000, 950000, 
         'Le dernier iPhone avec puce A17 Pro, appareil photo professionnel et écran Super Retina XDR de 6.7 pouces.',
         'iPhone 15 Pro Max - 256GB, Titane Naturel', cat_electronique_id, vendor_tech_id, 'active', true,
         ARRAY['/images/products/iphone-15-pro-max-1.jpg', '/images/products/iphone-15-pro-max-2.jpg'])
        ON CONFLICT (slug) DO NOTHING;

        INSERT INTO products (name, slug, sku, price, description, short_description, category_id, vendor_id, status, featured, images) VALUES
        ('MacBook Air M3', 'macbook-air-m3', 'MBA-M3-001', 1200000,
         'MacBook Air avec puce M3, écran Liquid Retina 13 pouces, jusqu''à 18h d''autonomie.',
         'MacBook Air M3 - 13 pouces, 8GB RAM, 256GB SSD', cat_electronique_id, vendor_tech_id, 'active', true,
         ARRAY['/images/products/macbook-air-m3-1.jpg'])
        ON CONFLICT (slug) DO NOTHING;
    END IF;

    IF cat_mode_id IS NOT NULL AND vendor_fashion_id IS NOT NULL THEN
        INSERT INTO products (name, slug, sku, price, compare_price, description, short_description, category_id, vendor_id, status, images) VALUES
        ('Robe Élégante Africaine', 'robe-elegante-africaine', 'REA-001', 45000, 55000,
         'Magnifique robe traditionnelle africaine moderne, parfaite pour les occasions spéciales.',
         'Robe en wax authentique, coupe moderne', cat_mode_id, vendor_fashion_id, 'active',
         ARRAY['/images/products/robe-africaine-1.jpg'])
        ON CONFLICT (slug) DO NOTHING;
    END IF;
END $$;

-- Bannières de test
INSERT INTO banners (title, subtitle, image_url, link_url, button_text, position, status) VALUES
('Soldes Électronique', 'Jusqu''à -30% sur tous les smartphones', '/images/banners/electronics-sale.jpg', '/category/electronique', 'Voir les offres', 'hero', 'active'),
('Nouvelle Collection Mode', 'Découvrez les tendances 2025', '/images/banners/fashion-collection.jpg', '/category/mode-beaute', 'Explorer', 'hero', 'active');

-- Afficher un résumé
SELECT 'Configuration terminée!' as message;
SELECT COUNT(*) as categories_count FROM categories;
SELECT COUNT(*) as vendors_count FROM vendors;
SELECT COUNT(*) as products_count FROM products;
SELECT COUNT(*) as banners_count FROM banners;