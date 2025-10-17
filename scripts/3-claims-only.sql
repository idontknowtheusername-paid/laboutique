-- Migration Claims uniquement
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'claims' AND table_schema = 'public') THEN
        CREATE TABLE claims (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          claim_number VARCHAR(20) NOT NULL UNIQUE,
          user_id UUID NULL REFERENCES auth.users(id),
          order_id UUID NULL,
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

        CREATE INDEX idx_claims_claim_number ON claims(claim_number);
        CREATE INDEX idx_claims_user_id ON claims(user_id);
        CREATE INDEX idx_claims_status ON claims(status);
        
        ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can create claim" ON claims FOR INSERT WITH CHECK (true);
        
        RAISE NOTICE 'Table claims créée avec succès';
    ELSE
        RAISE NOTICE 'Table claims existe déjà';
    END IF;
END $$;