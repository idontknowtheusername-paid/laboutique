-- Création de la table claims
CREATE TABLE IF NOT EXISTS claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_number VARCHAR(20) NOT NULL UNIQUE,
  user_id UUID NULL REFERENCES auth.users(id),
  order_id UUID NULL REFERENCES orders(id),
  order_number VARCHAR(50) NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('delivery', 'product', 'payment', 'refund', 'vendor', 'other')),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  description TEXT NOT NULL,
  desired_solution VARCHAR(50) NOT NULL CHECK (desired_solution IN ('refund', 'replacement', 'repair', 'partial-refund', 'explanation', 'other')),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed', 'rejected')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  admin_notes TEXT NULL,
  resolution_notes TEXT NULL,
  assigned_to UUID NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE NULL
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_claims_claim_number ON claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_order_id ON claims(order_id);
CREATE INDEX IF NOT EXISTS idx_claims_order_number ON claims(order_number);
CREATE INDEX IF NOT EXISTS idx_claims_email ON claims(email);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_type ON claims(type);
CREATE INDEX IF NOT EXISTS idx_claims_priority ON claims(priority);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at);
CREATE INDEX IF NOT EXISTS idx_claims_assigned_to ON claims(assigned_to);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Mettre à jour resolved_at si le statut passe à 'resolved' ou 'closed'
  IF NEW.status IN ('resolved', 'closed') AND OLD.status NOT IN ('resolved', 'closed') THEN
    NEW.resolved_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION update_claims_updated_at();

-- RLS (Row Level Security)
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins (lecture/écriture complète)
CREATE POLICY "Admins can manage claims" ON claims
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

-- Politique pour les utilisateurs (lecture de leurs propres réclamations)
CREATE POLICY "Users can view their own claims" ON claims
  FOR SELECT USING (
    user_id = auth.uid() OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Politique pour l'insertion publique (création de réclamation)
CREATE POLICY "Anyone can create claims" ON claims
  FOR INSERT WITH CHECK (true);

-- Commentaires
COMMENT ON TABLE claims IS 'Table des réclamations des clients';
COMMENT ON COLUMN claims.claim_number IS 'Numéro unique de la réclamation';
COMMENT ON COLUMN claims.user_id IS 'ID de l\'utilisateur (si connecté)';
COMMENT ON COLUMN claims.order_id IS 'ID de la commande concernée';
COMMENT ON COLUMN claims.order_number IS 'Numéro de commande (pour les non-connectés)';
COMMENT ON COLUMN claims.type IS 'Type de réclamation (delivery, product, payment, etc.)';
COMMENT ON COLUMN claims.name IS 'Nom du client';
COMMENT ON COLUMN claims.email IS 'Email du client';
COMMENT ON COLUMN claims.phone IS 'Téléphone du client (optionnel)';
COMMENT ON COLUMN claims.description IS 'Description détaillée du problème';
COMMENT ON COLUMN claims.desired_solution IS 'Solution souhaitée par le client';
COMMENT ON COLUMN claims.status IS 'Statut de la réclamation (new, in_progress, resolved, etc.)';
COMMENT ON COLUMN claims.priority IS 'Priorité de la réclamation (low, medium, high, urgent)';
COMMENT ON COLUMN claims.admin_notes IS 'Notes internes de l\'admin';
COMMENT ON COLUMN claims.resolution_notes IS 'Notes de résolution';
COMMENT ON COLUMN claims.assigned_to IS 'Admin assigné à la réclamation';
COMMENT ON COLUMN claims.resolved_at IS 'Date de résolution de la réclamation';