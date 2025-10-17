-- Création de la table newsletters
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  source VARCHAR(50) DEFAULT 'website_footer',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches par email
CREATE INDEX IF NOT EXISTS idx_newsletters_email ON newsletters(email);
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_subscribed_at ON newsletters(subscribed_at);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_newsletters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_newsletters_updated_at
  BEFORE UPDATE ON newsletters
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletters_updated_at();

-- RLS (Row Level Security)
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins (lecture/écriture complète)
CREATE POLICY "Admins can manage newsletters" ON newsletters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN (
        'admin@jomionstore.com',
        'contact@jomionstore.com'
      )
    )
  );

-- Politique pour l'insertion publique (abonnement)
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletters
  FOR INSERT WITH CHECK (true);

-- Politique pour la mise à jour publique (désabonnement)
CREATE POLICY "Anyone can unsubscribe from newsletter" ON newsletters
  FOR UPDATE USING (true);

-- Commentaires
COMMENT ON TABLE newsletters IS 'Table des abonnements à la newsletter';
COMMENT ON COLUMN newsletters.email IS 'Adresse email de l\'abonné';
COMMENT ON COLUMN newsletters.status IS 'Statut de l\'abonnement (active, unsubscribed, bounced)';
COMMENT ON COLUMN newsletters.source IS 'Source de l\'abonnement (website_footer, popup, etc.)';
COMMENT ON COLUMN newsletters.subscribed_at IS 'Date d\'abonnement';
COMMENT ON COLUMN newsletters.unsubscribed_at IS 'Date de désabonnement';