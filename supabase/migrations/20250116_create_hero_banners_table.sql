-- Create hero_banners table for dynamic banner management
CREATE TABLE IF NOT EXISTS hero_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  cta_text VARCHAR(100) NOT NULL,
  cta_link VARCHAR(500) NOT NULL,
  image_url VARCHAR(1000) NOT NULL,
  gradient VARCHAR(100) DEFAULT 'from-jomionstore-primary to-orange-600',
  type VARCHAR(50) DEFAULT 'promotional' CHECK (type IN ('promotional', 'category', 'service', 'offer', 'new')),
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hero_banners_active ON hero_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_banners_type ON hero_banners(type);
CREATE INDEX IF NOT EXISTS idx_hero_banners_priority ON hero_banners(priority);
CREATE INDEX IF NOT EXISTS idx_hero_banners_active_priority ON hero_banners(is_active, priority);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_hero_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_hero_banners_updated_at
  BEFORE UPDATE ON hero_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_banners_updated_at();

-- Insert sample data
INSERT INTO hero_banners (title, subtitle, description, cta_text, cta_link, image_url, gradient, type, priority, is_active) VALUES
('Découvrez JomionStore', 'Le centre commercial digital du Bénin', 'Des milliers de produits authentiques, une livraison rapide et un service client exceptionnel.', 'Découvrir maintenant', '/products', 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1200', 'from-jomionstore-primary to-orange-600', 'promotional', 1, true),
('Électronique Premium', 'Les dernières technologies à votre portée', 'Smartphones, laptops, TV intelligentes et bien plus encore avec garantie officielle.', 'Voir la collection', '/category/electronique', 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=1200', 'from-jomionstore-secondary to-orange-600', 'category', 2, true),
('Mode & Style', 'Express your unique style', 'Découvrez les dernières tendances mode pour homme, femme et enfant.', 'Shopping mode', '/category/mode-beaute', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1200', 'from-purple-600 to-pink-600', 'category', 3, true),
('Livraison Gratuite', 'À Cotonou et environs', 'Commandez maintenant et recevez gratuitement vos produits sous 24h.', 'En savoir plus', '/delivery-info', 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=1200', 'from-green-600 to-teal-600', 'service', 4, true),
('Paiement Sécurisé', 'Vos transactions sont protégées', 'Cartes bancaires, Mobile Money, virement. Toutes vos données sont chiffrées et sécurisées.', 'Découvrir', '/payment-info', 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=1200', 'from-orange-600 to-indigo-600', 'service', 5, true);

-- Enable RLS
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to active hero banners" ON hero_banners
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage hero banners" ON hero_banners
  FOR ALL USING (auth.role() = 'authenticated');