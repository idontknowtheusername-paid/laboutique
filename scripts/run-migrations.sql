-- Script pour exécuter toutes les migrations manquantes
-- À exécuter dans le SQL Editor de Supabase

-- =============================================
-- 1. MIGRATION NEWSLETTERS
-- =============================================
-- Vérifier si la table existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'newsletters' AND table_schema = 'public') THEN
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

        RAISE NOTICE 'Table newsletters créée avec succès';
    ELSE
        RAISE NOTICE 'Table newsletters existe déjà';
    END IF;
END $$;

-- =============================================
-- 2. MIGRATION CONTACT_MESSAGES
-- =============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_messages' AND table_schema = 'public') THEN
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

        RAISE NOTICE 'Table contact_messages créée avec succès';
    ELSE
        RAISE NOTICE 'Table contact_messages existe déjà';
    END IF;
END $$;

-- =============================================
-- 3. MIGRATION CLAIMS
-- =============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'claims' AND table_schema = 'public') THEN
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

        RAISE NOTICE 'Table claims créée avec succès';
    ELSE
        RAISE NOTICE 'Table claims existe déjà';
    END IF;
END $$;

-- =============================================
-- 4. VÉRIFICATION REVIEWS
-- =============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews' AND table_schema = 'public') THEN
        RAISE NOTICE 'Table reviews manquante - Exécutez la migration 20251015_create_reviews_table.sql';
    ELSE
        RAISE NOTICE 'Table reviews existe déjà';
    END IF;
END $$;

-- =============================================
-- 5. VÉRIFICATION FINALE
-- =============================================
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('newsletters', 'contact_messages', 'claims', 'reviews') THEN '✅ Créée'
        ELSE '❌ Manquante'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('newsletters', 'contact_messages', 'claims', 'reviews')
ORDER BY table_name;