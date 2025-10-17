-- Création de la table contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  subject VARCHAR(500) NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT NULL,
  assigned_to UUID NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE NULL
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_category ON contact_messages(category);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_assigned_to ON contact_messages(assigned_to);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
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

CREATE TRIGGER trigger_update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();

-- RLS (Row Level Security)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins (lecture/écriture complète)
CREATE POLICY "Admins can manage contact messages" ON contact_messages
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

-- Politique pour l'insertion publique (envoi de message)
CREATE POLICY "Anyone can send contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Commentaires
COMMENT ON TABLE contact_messages IS 'Table des messages de contact des clients';
COMMENT ON COLUMN contact_messages.name IS 'Nom du client';
COMMENT ON COLUMN contact_messages.email IS 'Email du client';
COMMENT ON COLUMN contact_messages.phone IS 'Téléphone du client (optionnel)';
COMMENT ON COLUMN contact_messages.subject IS 'Sujet du message';
COMMENT ON COLUMN contact_messages.category IS 'Catégorie du message (general, order, payment, etc.)';
COMMENT ON COLUMN contact_messages.message IS 'Contenu du message';
COMMENT ON COLUMN contact_messages.status IS 'Statut du traitement (new, read, in_progress, resolved, closed)';
COMMENT ON COLUMN contact_messages.admin_notes IS 'Notes internes de l\'admin';
COMMENT ON COLUMN contact_messages.assigned_to IS 'Admin assigné au message';
COMMENT ON COLUMN contact_messages.resolved_at IS 'Date de résolution du message';