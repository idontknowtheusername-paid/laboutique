-- Migration: Créer table pour stocker les tokens OAuth AliExpress
-- Date: 2025-10-11
-- Description: Table pour stocker les access_token et refresh_token OAuth

-- Créer la table aliexpress_oauth_tokens
CREATE TABLE IF NOT EXISTS aliexpress_oauth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_aliexpress_oauth_tokens_user_id ON aliexpress_oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_aliexpress_oauth_tokens_expires_at ON aliexpress_oauth_tokens(expires_at);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_aliexpress_oauth_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_aliexpress_oauth_tokens_updated_at ON aliexpress_oauth_tokens;
CREATE TRIGGER trigger_update_aliexpress_oauth_tokens_updated_at
  BEFORE UPDATE ON aliexpress_oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_aliexpress_oauth_tokens_updated_at();

-- Commentaires
COMMENT ON TABLE aliexpress_oauth_tokens IS 'Stockage des tokens OAuth pour AliExpress Dropship APIs';
COMMENT ON COLUMN aliexpress_oauth_tokens.access_token IS 'Token d''accès OAuth pour appeler les APIs';
COMMENT ON COLUMN aliexpress_oauth_tokens.refresh_token IS 'Token pour rafraîchir l''access_token expiré';
COMMENT ON COLUMN aliexpress_oauth_tokens.expires_at IS 'Date d''expiration de l''access_token';
