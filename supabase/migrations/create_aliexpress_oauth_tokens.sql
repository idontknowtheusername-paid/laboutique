-- Table pour stocker les tokens OAuth AliExpress
CREATE TABLE IF NOT EXISTS aliexpress_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_aliexpress_tokens_expires_at ON aliexpress_oauth_tokens(expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_aliexpress_tokens_user_id ON aliexpress_oauth_tokens(user_id);

-- RLS: Seul le service role peut accéder (pas les utilisateurs)
ALTER TABLE aliexpress_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Seul le service role peut tout faire
CREATE POLICY "Service role full access" ON aliexpress_oauth_tokens
  FOR ALL
  USING (auth.role() = 'service_role');

-- Insérer le token actuel
-- Note: Les tokens AliExpress durent 30 jours (access_token) et 60 jours (refresh_token)
INSERT INTO aliexpress_oauth_tokens (
  access_token,
  refresh_token,
  expires_at,
  token_type
) VALUES (
  '50000200a38OmG7gApzuUDh3kUCjQZvSCckgUeoSVEJDypxEVU16567057PwKYy65YY2',
  NULL,
  NOW() + INTERVAL '30 days',
  'Bearer'
) ON CONFLICT DO NOTHING;
