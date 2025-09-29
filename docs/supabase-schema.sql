-- Schéma de base de données pour La Boutique B
-- À exécuter dans l'éditeur SQL de Supabase

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des vendeurs
CREATE TABLE IF NOT EXISTS vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  website TEXT,
  description TEXT,
  logo_url TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  sku VARCHAR(255),
  barcode VARCHAR(255),
  weight DECIMAL(8,2),
  dimensions JSONB, -- {length, width, height, unit}
  images TEXT[] DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'archived')),
  featured BOOLEAN DEFAULT FALSE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  track_stock BOOLEAN DEFAULT TRUE,
  allow_backorder BOOLEAN DEFAULT FALSE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  tags TEXT[] DEFAULT '{}',
  source_url TEXT, -- URL d'origine pour les produits importés
  source_platform VARCHAR(100), -- 'alibaba', 'aliexpress', etc.
  import_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_source_platform ON products(source_platform);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_vendors_slug ON vendors(slug);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Données de base
INSERT INTO categories (name, slug, description, status) VALUES
('Électronique', 'electronique', 'Appareils électroniques et gadgets', 'active'),
('Mode & Accessoires', 'mode-accessoires', 'Vêtements et accessoires de mode', 'active'),
('Maison & Jardin', 'maison-jardin', 'Articles pour la maison et le jardin', 'active'),
('Sports & Loisirs', 'sports-loisirs', 'Équipements sportifs et de loisirs', 'active'),
('Beauté & Santé', 'beaute-sante', 'Produits de beauté et de santé', 'active'),
('Automobile', 'automobile', 'Pièces et accessoires automobiles', 'active'),
('Produits Importés', 'produits-importes', 'Catégorie par défaut pour les produits importés', 'active')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO vendors (name, slug, email, status) VALUES
('Vendeur par défaut', 'vendeur-defaut', 'default@laboutique.bj', 'active')
ON CONFLICT (slug) DO NOTHING;

-- Politique RLS (Row Level Security) - optionnel
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Politiques pour permettre l'accès public en lecture
-- CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access on vendors" ON vendors FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (status = 'active');