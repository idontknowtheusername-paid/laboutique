-- Migration Newsletter uniquement
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'newsletters' AND table_schema = 'public') THEN
        CREATE TABLE newsletters (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
          source VARCHAR(50) DEFAULT 'website_footer',
          subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX idx_newsletters_email ON newsletters(email);
        CREATE INDEX idx_newsletters_status ON newsletters(status);
        
        ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can subscribe" ON newsletters FOR INSERT WITH CHECK (true);
        CREATE POLICY "Anyone can unsubscribe" ON newsletters FOR UPDATE USING (true);
        
        RAISE NOTICE 'Table newsletters créée avec succès';
    ELSE
        RAISE NOTICE 'Table newsletters existe déjà';
    END IF;
END $$;