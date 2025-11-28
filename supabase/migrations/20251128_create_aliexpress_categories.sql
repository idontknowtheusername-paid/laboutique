-- Table pour stocker les catégories AliExpress
CREATE TABLE IF NOT EXISTS aliexpress_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL UNIQUE,
  category_name TEXT NOT NULL,
  parent_category_id TEXT,
  has_children BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_aliexpress_categories_category_id ON aliexpress_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_aliexpress_categories_parent_id ON aliexpress_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_aliexpress_categories_name ON aliexpress_categories(category_name);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_aliexpress_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_aliexpress_categories_updated_at
  BEFORE UPDATE ON aliexpress_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_aliexpress_categories_updated_at();

-- Commentaires
COMMENT ON TABLE aliexpress_categories IS 'Catégories AliExpress récupérées via l''API Dropship';
COMMENT ON COLUMN aliexpress_categories.category_id IS 'ID de la catégorie AliExpress';
COMMENT ON COLUMN aliexpress_categories.category_name IS 'Nom de la catégorie';
COMMENT ON COLUMN aliexpress_categories.parent_category_id IS 'ID de la catégorie parente';
COMMENT ON COLUMN aliexpress_categories.has_children IS 'Indique si la catégorie a des sous-catégories';
