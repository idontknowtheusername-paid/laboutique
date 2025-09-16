-- Script SQL pour ajouter des produits temporaires
-- À exécuter directement dans l'éditeur SQL de Supabase

-- 0. Préparer les contraintes nécessaires aux UPSERTS
-- Crée des index uniques si absents pour permettre ON CONFLICT (...)
CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_idx ON categories (slug);
CREATE UNIQUE INDEX IF NOT EXISTS vendors_slug_idx ON vendors (slug);
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON products (slug);
-- Optionnel, utile si vous souhaitez aussi garantir l'unicité des SKU
-- CREATE UNIQUE INDEX IF NOT EXISTS products_sku_idx ON products (sku);
CREATE UNIQUE INDEX IF NOT EXISTS banners_title_idx ON banners (title);

-- 1. Nettoyer les données existantes (optionnel)
-- DELETE FROM products;
-- DELETE FROM vendors;
-- DELETE FROM categories;

-- 2. Ajouter les catégories principales
INSERT INTO categories (name, slug, description, status, sort_order) VALUES
('Électronique', 'electronique', 'Smartphones, ordinateurs, accessoires tech', 'active', 1),
('Mode & Beauté', 'mode-beaute', 'Vêtements, chaussures, cosmétiques', 'active', 2),
('Maison & Jardin', 'maison-jardin', 'Mobilier, décoration, jardinage', 'active', 3),
('Sport & Loisirs', 'sport-loisirs', 'Équipements sportifs, jeux, loisirs', 'active', 4)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = now();

-- 3. Ajouter des vendeurs
INSERT INTO vendors (name, slug, email, description, status, rating, total_reviews) VALUES
('TechStore Bénin', 'techstore-benin', 'contact@techstore.bj', 'Spécialiste en électronique et high-tech', 'active', 4.5, 150),
('Fashion Plus', 'fashion-plus', 'info@fashionplus.bj', 'Mode tendance pour tous', 'active', 4.3, 89),
('Maison Confort', 'maison-confort', 'hello@maisonconfort.bj', 'Tout pour votre intérieur', 'active', 4.7, 234)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = now();

-- 4. Ajouter des produits avec de vraies relations
DO $$
DECLARE
    cat_electronique_id uuid;
    cat_mode_id uuid;
    cat_maison_id uuid;
    cat_sport_id uuid;
    vendor_tech_id uuid;
    vendor_fashion_id uuid;
    vendor_maison_id uuid;
BEGIN
    -- Récupérer les IDs
    SELECT id INTO cat_electronique_id FROM categories WHERE slug = 'electronique';
    SELECT id INTO cat_mode_id FROM categories WHERE slug = 'mode-beaute';
    SELECT id INTO cat_maison_id FROM categories WHERE slug = 'maison-jardin';
    SELECT id INTO cat_sport_id FROM categories WHERE slug = 'sport-loisirs';
    SELECT id INTO vendor_tech_id FROM vendors WHERE slug = 'techstore-benin';
    SELECT id INTO vendor_fashion_id FROM vendors WHERE slug = 'fashion-plus';
    SELECT id INTO vendor_maison_id FROM vendors WHERE slug = 'maison-confort';

    -- Produits Électronique
    INSERT INTO products (name, slug, sku, description, short_description, price, compare_price, category_id, vendor_id, brand, images, status, featured, quantity, track_quantity) VALUES
    
    ('iPhone 15 Pro Max 256GB', 'iphone-15-pro-max-256gb', 'IPHONE15PM-256', 
     'Le dernier iPhone avec puce A17 Pro, appareil photo professionnel et écran Super Retina XDR de 6.7 pouces.',
     'iPhone 15 Pro Max - 256GB, Titane Naturel', 
     850000, 950000, cat_electronique_id, vendor_tech_id, 'Apple',
     ARRAY['https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600'],
     'active', true, 25, true),

    ('MacBook Air M3 13"', 'macbook-air-m3-13', 'MBA-M3-13-256',
     'MacBook Air avec puce M3, écran Liquid Retina 13 pouces, jusqu''à 18h d''autonomie.',
     'MacBook Air M3 - 13 pouces, 8GB RAM, 256GB SSD',
     1200000, 1350000, cat_electronique_id, vendor_tech_id, 'Apple',
     ARRAY['https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=600'],
     'active', true, 15, true),

    ('Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'SGS24U-512',
     'Smartphone Samsung Galaxy S24 Ultra avec S Pen, caméra 200MP et écran Dynamic AMOLED 2X.',
     'Galaxy S24 Ultra - 512GB, Titanium Black',
     780000, 890000, cat_electronique_id, vendor_tech_id, 'Samsung',
     ARRAY['https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600'],
     'active', false, 30, true),

    ('AirPods Pro 2ème génération', 'airpods-pro-2', 'APP-2GEN',
     'Écouteurs sans fil avec réduction de bruit active, audio spatial personnalisé.',
     'AirPods Pro 2 - Réduction de bruit active',
     140000, 180000, cat_electronique_id, vendor_tech_id, 'Apple',
     ARRAY['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600'],
     'active', false, 50, true),

    ('iPad Pro 12.9" M2', 'ipad-pro-12-9-m2', 'IPADPRO-M2-12',
     'iPad Pro avec puce M2, écran Liquid Retina XDR 12.9 pouces, compatible Apple Pencil.',
     'iPad Pro M2 - 12.9 pouces, 128GB',
     650000, 750000, cat_electronique_id, vendor_tech_id, 'Apple',
     ARRAY['https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=600'],
     'active', true, 20, true),

    -- Produits Mode & Beauté
    ('Robe Élégante Africaine', 'robe-elegante-africaine', 'REA-WAX-001',
     'Magnifique robe traditionnelle africaine moderne, parfaite pour les occasions spéciales.',
     'Robe en wax authentique, coupe moderne',
     45000, 55000, cat_mode_id, vendor_fashion_id, 'African Style',
     ARRAY['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'],
     'active', true, 20, true),

    ('Costume Homme Élégant', 'costume-homme-elegant', 'CHE-SLIM-001',
     'Costume homme coupe slim, parfait pour les événements professionnels et cérémonies.',
     'Costume slim fit, tissu premium',
     120000, 150000, cat_mode_id, vendor_fashion_id, 'Elegant Man',
     ARRAY['https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600'],
     'active', false, 12, true),

    ('Parfum Femme Premium', 'parfum-femme-premium', 'PFP-ROSE-001',
     'Parfum féminin aux notes florales, longue tenue, idéal pour toutes occasions.',
     'Parfum floral premium - 100ml',
     85000, NULL, cat_mode_id, vendor_fashion_id, 'Essence',
     ARRAY['https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=600'],
     'active', false, 35, true),

    ('Sac à Main Cuir Premium', 'sac-main-cuir-premium', 'SMCP-LEATHER-001',
     'Sac à main en cuir véritable, design élégant, parfait pour le quotidien et les sorties.',
     'Sac cuir premium - Multiple compartiments',
     75000, NULL, cat_mode_id, vendor_fashion_id, 'Luxury Bags',
     ARRAY['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600'],
     'active', false, 18, true),

    -- Produits Maison & Jardin
    ('Canapé 3 Places Moderne', 'canape-3-places-moderne', 'C3P-MOD-001',
     'Canapé 3 places au design moderne, tissu de qualité, parfait pour le salon.',
     'Canapé moderne 3 places - Tissu premium',
     280000, 320000, cat_maison_id, vendor_maison_id, 'HomeComfort',
     ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600'],
     'active', true, 8, true),

    ('Réfrigérateur Samsung 400L', 'refrigerateur-samsung-400l', 'REF-SAM-400L',
     'Réfrigérateur Samsung 400L, technologie No Frost, classe énergétique A++.',
     'Réfrigérateur 400L - No Frost',
     450000, 520000, cat_maison_id, vendor_maison_id, 'Samsung',
     ARRAY['https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=600'],
     'active', false, 6, true),

    ('Table à Manger 6 Places', 'table-manger-6-places', 'TM6P-BOIS-001',
     'Table à manger en bois massif pour 6 personnes, design moderne et robuste.',
     'Table 6 places - Bois massif',
     180000, NULL, cat_maison_id, vendor_maison_id, 'Furniture Plus',
     ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600'],
     'active', false, 10, true),

    -- Produits Sport & Loisirs
    ('Ensemble Fitness Homme', 'ensemble-fitness-homme', 'EFH-SPORT-001',
     'Ensemble sportif homme respirant, parfait pour la salle de sport et le running.',
     'Ensemble fitness - Tissu respirant',
     35000, NULL, cat_sport_id, vendor_fashion_id, 'SportWear',
     ARRAY['https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=600'],
     'active', false, 40, true),

    ('Montre Connectée Samsung', 'montre-connectee-samsung', 'MCS-WATCH-001',
     'Montre connectée Samsung avec GPS, suivi santé, étanche.',
     'Montre connectée - GPS + Santé',
     150000, 180000, cat_sport_id, vendor_tech_id, 'Samsung',
     ARRAY['https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=600'],
     'active', true, 18, true),

    ('Nike Air Max 270 React', 'nike-air-max-270-react', 'NAM270R-001',
     'Chaussures de running Nike avec technologie React, confort optimal pour le sport.',
     'Nike Air Max 270 - Technologie React',
     85000, NULL, cat_sport_id, vendor_fashion_id, 'Nike',
     ARRAY['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=600'],
     'active', false, 25, true)

    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      price = EXCLUDED.price,
      compare_price = EXCLUDED.compare_price,
      description = EXCLUDED.description,
      images = EXCLUDED.images,
      updated_at = now();

END $$;

-- 5. Ajouter des bannières pour le carrousel
INSERT INTO banners (title, subtitle, image_url, link_url, button_text, position, status, sort_order) VALUES
('Soldes Électronique', 'Jusqu''à -30% sur tous les smartphones', 
 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=1200',
 '/category/electronique', 'Voir les offres', 'hero', 'active', 1),

('Nouvelle Collection Mode', 'Découvrez les tendances 2025',
 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1200',
 '/category/mode-beaute', 'Explorer', 'hero', 'active', 2),

('Équipez Votre Maison', 'Mobilier et électroménager à prix réduits',
 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200',
 '/category/maison-jardin', 'Découvrir', 'hero', 'active', 3)

ON CONFLICT (title) DO UPDATE SET
  subtitle = EXCLUDED.subtitle,
  image_url = EXCLUDED.image_url,
  updated_at = now();

-- 6. Afficher un résumé des données ajoutées
SELECT 'RÉSUMÉ DES DONNÉES AJOUTÉES:' as message;
SELECT 'Catégories:', COUNT(*) as total FROM categories WHERE status = 'active';
SELECT 'Vendeurs:', COUNT(*) as total FROM vendors WHERE status = 'active';
SELECT 'Produits:', COUNT(*) as total FROM products WHERE status = 'active';
SELECT 'Bannières:', COUNT(*) as total FROM banners WHERE status = 'active';

-- 7. Vérifier les relations
SELECT 'VÉRIFICATION DES RELATIONS:' as message;
SELECT 
  p.name as produit,
  c.name as categorie,
  v.name as vendeur,
  p.price as prix,
  p.featured as vedette
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN vendors v ON p.vendor_id = v.id
WHERE p.status = 'active'
ORDER BY p.featured DESC, p.created_at DESC;