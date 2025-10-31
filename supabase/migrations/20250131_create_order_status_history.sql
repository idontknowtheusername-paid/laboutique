-- Migration pour créer la table d'historique des changements de statut
-- À exécuter dans le SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status VARCHAR(50) NOT NULL,
  new_status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(50) NOT NULL, -- 'admin', 'webhook', 'system'
  reason TEXT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_changed_at ON order_status_history(changed_at);

-- RLS (Row Level Security)
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins
CREATE POLICY "Admins can manage order status history" ON order_status_history
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
COMMENT ON TABLE order_status_history IS 'Historique des changements de statut des commandes';
COMMENT ON COLUMN order_status_history.changed_by IS 'Source du changement: admin, webhook, system';