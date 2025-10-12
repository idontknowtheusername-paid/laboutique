-- Script pour ajouter les 9 nouvelles catégories à la base de données
-- Exécuter dans Supabase SQL Editor

-- 1. Ajouter les nouvelles catégories avec ordre de priorité
INSERT INTO categories (name, slug, description, status, sort_order) VALUES
-- HAUTE PRIORITÉ - Sections essentielles
('Bébé & Enfant', 'bebe-enfant', 'Vêtements bébé, jouets, puériculture, articles pour enfants', 'active', 5),
('Alimentation & Boissons', 'alimentation-boissons', 'Épicerie, boissons, produits frais, alimentation locale et importée', 'active', 6),

-- PRIORITÉ MOYENNE - Sections complémentaires  
('Éducation & Livres', 'education-livres', 'Livres, fournitures scolaires, matériel éducatif, papeterie', 'active', 7),
('Jardinage & Agriculture', 'jardinage-agriculture', 'Outils, semences, engrais, équipements agricoles et jardinage', 'active', 8),
('Bricolage & Outillage', 'bricolage-outillage', 'Outils, quincaillerie, matériaux de construction, équipements DIY', 'active', 9),
('Téléphonie & Accessoires', 'telephonie-accessoires', 'Smartphones, accessoires téléphone, réparations, gadgets mobiles', 'active', 10),

-- PRIORITÉ BASSE - Sections spécialisées
('Voyage & Bagages', 'voyage-bagages', 'Valises, sacs de voyage, accessoires voyage, équipements de voyage', 'active', 11),
('Musique & Instruments', 'musique-instruments', 'Instruments de musique, accessoires audio, équipements de son', 'active', 12),
('Art & Artisanat', 'art-artisanat', 'Matériel artistique, artisanat local, fournitures créatives', 'active', 13)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- 2. Vérifier l'insertion
SELECT id, name, slug, description, sort_order, status, created_at
FROM categories 
ORDER BY sort_order ASC;

-- 3. Compter le total des catégories
SELECT COUNT(*) as total_categories FROM categories WHERE status = 'active';