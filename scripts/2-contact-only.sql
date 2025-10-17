-- Migration Contact uniquement
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_messages' AND table_schema = 'public') THEN
        CREATE TABLE contact_messages (
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

        CREATE INDEX idx_contact_messages_email ON contact_messages(email);
        CREATE INDEX idx_contact_messages_status ON contact_messages(status);
        
        ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can insert contact message" ON contact_messages FOR INSERT WITH CHECK (true);
        
        RAISE NOTICE 'Table contact_messages créée avec succès';
    ELSE
        RAISE NOTICE 'Table contact_messages existe déjà';
    END IF;
END $$;