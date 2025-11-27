-- Création des tables pour le système de support/chatbot

-- Table des conversations de support
CREATE TABLE IF NOT EXISTS support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des messages de support
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_support_conversations_user_id ON support_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_support_conversations_status ON support_conversations(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_conversation_id ON support_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_support_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS trigger_update_support_conversation_updated_at ON support_conversations;
CREATE TRIGGER trigger_update_support_conversation_updated_at
  BEFORE UPDATE ON support_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_support_conversation_updated_at();

-- Politiques RLS (Row Level Security)
ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres conversations
CREATE POLICY "Users can view own conversations"
  ON support_conversations
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Les utilisateurs peuvent créer des conversations
CREATE POLICY "Users can create conversations"
  ON support_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Les utilisateurs peuvent mettre à jour leurs conversations
CREATE POLICY "Users can update own conversations"
  ON support_conversations
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Les utilisateurs peuvent voir les messages de leurs conversations
CREATE POLICY "Users can view messages from own conversations"
  ON support_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_conversations
      WHERE support_conversations.id = support_messages.conversation_id
      AND (support_conversations.user_id = auth.uid() OR support_conversations.user_id IS NULL)
    )
  );

-- Les utilisateurs peuvent créer des messages dans leurs conversations
CREATE POLICY "Users can create messages in own conversations"
  ON support_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_conversations
      WHERE support_conversations.id = support_messages.conversation_id
      AND (support_conversations.user_id = auth.uid() OR support_conversations.user_id IS NULL)
    )
  );

-- Commentaires pour documentation
COMMENT ON TABLE support_conversations IS 'Conversations de support client avec le chatbot';
COMMENT ON TABLE support_messages IS 'Messages échangés dans les conversations de support';
