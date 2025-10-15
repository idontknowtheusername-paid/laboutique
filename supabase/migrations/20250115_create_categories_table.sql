-- Créer la table des catégories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  icon VARCHAR(10) DEFAULT '📁',
  color VARCHAR(100) DEFAULT 'bg-gray-100 text-gray-800',
  slug VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur le parent_id pour les requêtes hiérarchiques
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Créer un index sur le slug pour les requêtes par slug
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Créer un index sur le nom pour les recherches
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Fonction pour générer automatiquement le slug
CREATE OR REPLACE FUNCTION generate_category_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    
    -- Vérifier l'unicité du slug
    WHILE EXISTS (SELECT 1 FROM categories WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug := NEW.slug || '-' || extract(epoch from now())::bigint;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le slug
CREATE TRIGGER trigger_generate_category_slug
  BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION generate_category_slug();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_category_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER trigger_update_category_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_category_updated_at();

-- Insérer quelques catégories de base
INSERT INTO categories (name, description, icon, color) VALUES
('Électronique', 'Appareils électroniques et accessoires', '📱', 'bg-blue-100 text-blue-800'),
('Mode', 'Vêtements et accessoires de mode', '👕', 'bg-pink-100 text-pink-800'),
('Maison', 'Articles pour la maison et le jardin', '🏠', 'bg-green-100 text-green-800'),
('Beauté', 'Produits de beauté et soins', '💄', 'bg-purple-100 text-purple-800'),
('Sport', 'Équipements et vêtements de sport', '⚽', 'bg-orange-100 text-orange-800')
ON CONFLICT (slug) DO NOTHING;