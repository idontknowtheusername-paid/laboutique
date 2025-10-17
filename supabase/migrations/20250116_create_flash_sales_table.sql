-- Migration pour créer la table flash_sales
-- À exécuter dans le SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS flash_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended', 'cancelled')),
  is_featured BOOLEAN DEFAULT false,
  banner_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les produits en flash sale
CREATE TABLE IF NOT EXISTS flash_sale_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flash_sale_id UUID NOT NULL REFERENCES flash_sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  flash_price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  discount_percentage INTEGER NOT NULL,
  max_quantity INTEGER DEFAULT NULL, -- Limite par client
  sold_quantity INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(flash_sale_id, product_id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_flash_sales_status ON flash_sales(status);
CREATE INDEX IF NOT EXISTS idx_flash_sales_dates ON flash_sales(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_flash_sale_products_sale_id ON flash_sale_products(flash_sale_id);
CREATE INDEX IF NOT EXISTS idx_flash_sale_products_product_id ON flash_sale_products(product_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_flash_sales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_flash_sales_updated_at
    BEFORE UPDATE ON flash_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_flash_sales_updated_at();

CREATE TRIGGER trigger_flash_sale_products_updated_at
    BEFORE UPDATE ON flash_sale_products
    FOR EACH ROW
    EXECUTE FUNCTION update_flash_sales_updated_at();

-- Fonction pour mettre à jour le statut des flash sales
CREATE OR REPLACE FUNCTION update_flash_sales_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le statut basé sur les dates
    UPDATE flash_sales 
    SET status = CASE 
        WHEN NOW() < start_date THEN 'scheduled'
        WHEN NOW() BETWEEN start_date AND end_date THEN 'active'
        WHEN NOW() > end_date THEN 'ended'
        ELSE status
    END
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le statut
CREATE TRIGGER trigger_update_flash_sales_status
    AFTER INSERT OR UPDATE ON flash_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_flash_sales_status();

-- RLS (Row Level Security)
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_sale_products ENABLE ROW LEVEL SECURITY;

-- Politiques pour flash_sales
CREATE POLICY "Anyone can view active flash sales" ON flash_sales
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage flash sales" ON flash_sales
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN (
                'admin@jomionstore.com',
                'support@jomionstore.com'
            )
        )
    );

-- Politiques pour flash_sale_products
CREATE POLICY "Anyone can view flash sale products" ON flash_sale_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM flash_sales 
            WHERE flash_sales.id = flash_sale_products.flash_sale_id 
            AND flash_sales.status = 'active'
        )
    );

CREATE POLICY "Admins can manage flash sale products" ON flash_sale_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN (
                'admin@jomionstore.com',
                'support@jomionstore.com'
            )
        )
    );

-- Commentaires
COMMENT ON TABLE flash_sales IS 'Gestion des ventes flash avec dates de début et fin';
COMMENT ON TABLE flash_sale_products IS 'Produits associés aux ventes flash avec prix spéciaux';
COMMENT ON COLUMN flash_sales.status IS 'Statut de la vente flash: scheduled, active, ended, cancelled';
COMMENT ON COLUMN flash_sale_products.max_quantity IS 'Limite de quantité par client (NULL = pas de limite)';
COMMENT ON COLUMN flash_sale_products.sold_quantity IS 'Quantité vendue pendant la vente flash';