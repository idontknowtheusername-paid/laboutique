-- =====================================================
-- REQUÊTES SQL POUR LA BOUTIQUE B - ADMIN PANEL
-- =====================================================

-- 1. TABLE COUPONS
-- =====================================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed', 'free_shipping')),
    value DECIMAL(10,2) NOT NULL DEFAULT 0,
    min_amount DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2) DEFAULT 0,
    usage_limit INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_type ON coupons(type);
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON coupons(created_at);

-- 2. TABLE COUPON_USAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS coupon_usages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    order_id UUID,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id ON coupon_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_order_id ON coupon_usages(order_id);

-- 3. TABLE RETURNS (RETOURS ET REMBOURSEMENTS)
-- =====================================================
CREATE TABLE IF NOT EXISTS return_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_method VARCHAR(50) DEFAULT 'original_payment',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES auth.users(id)
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_return_requests_order_id ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_user_id ON return_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON return_requests(status);
CREATE INDEX IF NOT EXISTS idx_return_requests_created_at ON return_requests(created_at);

-- 4. TABLE BACKUPS
-- =====================================================
CREATE TABLE IF NOT EXISTS backups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('full', 'incremental', 'database', 'files')),
    size BIGINT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('completed', 'running', 'failed', 'scheduled')),
    location VARCHAR(20) DEFAULT 'cloud' CHECK (location IN ('local', 'cloud', 'external')),
    description TEXT,
    tables_count INTEGER DEFAULT 0,
    records_count INTEGER DEFAULT 0,
    compression_ratio DECIMAL(5,2) DEFAULT 0,
    encryption_enabled BOOLEAN DEFAULT true,
    checksum VARCHAR(255),
    duration INTEGER DEFAULT 0, -- en secondes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_backups_status ON backups(status);
CREATE INDEX IF NOT EXISTS idx_backups_type ON backups(type);
CREATE INDEX IF NOT EXISTS idx_backups_location ON backups(location);
CREATE INDEX IF NOT EXISTS idx_backups_created_at ON backups(created_at);

-- 5. TABLE BACKUP_SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS backup_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    frequency VARCHAR(20) DEFAULT 'daily' CHECK (frequency IN ('hourly', 'daily', 'weekly', 'monthly')),
    retention_days INTEGER DEFAULT 30,
    compression_enabled BOOLEAN DEFAULT true,
    encryption_enabled BOOLEAN DEFAULT true,
    location VARCHAR(20) DEFAULT 'cloud' CHECK (location IN ('local', 'cloud', 'external')),
    auto_cleanup BOOLEAN DEFAULT true,
    notification_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLE ANALYTICS_EVENTS (pour les analytics avancées)
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(255),
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- 7. TABLE NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT false,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 8. POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour les coupons (lecture pour tous, écriture pour les admins)
CREATE POLICY "Coupons are viewable by everyone" ON coupons FOR SELECT USING (true);
CREATE POLICY "Only admins can manage coupons" ON coupons FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Politiques pour les usages de coupons
CREATE POLICY "Coupon usages are viewable by users" ON coupon_usages FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);
CREATE POLICY "Users can create coupon usages" ON coupon_usages FOR INSERT WITH CHECK (user_id = auth.uid());

-- Politiques pour les retours
CREATE POLICY "Return requests are viewable by users" ON return_requests FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);
CREATE POLICY "Users can create return requests" ON return_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Only admins can update return requests" ON return_requests FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Politiques pour les backups (admin seulement)
CREATE POLICY "Only admins can manage backups" ON backups FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Politiques pour les paramètres de backup (admin seulement)
CREATE POLICY "Only admins can manage backup settings" ON backup_settings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Politiques pour les analytics (admin seulement)
CREATE POLICY "Only admins can view analytics" ON analytics_events FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);
CREATE POLICY "Analytics events can be created by anyone" ON analytics_events FOR INSERT WITH CHECK (true);

-- Politiques pour les notifications
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- 9. FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_return_requests_updated_at BEFORE UPDATE ON return_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_backups_updated_at BEFORE UPDATE ON backups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_backup_settings_updated_at BEFORE UPDATE ON backup_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. DONNÉES DE TEST (OPTIONNEL)
-- =====================================================

-- Insérer des paramètres de backup par défaut
INSERT INTO backup_settings (frequency, retention_days, compression_enabled, encryption_enabled, location, auto_cleanup)
VALUES ('daily', 30, true, true, 'cloud', true)
ON CONFLICT DO NOTHING;

-- Insérer quelques coupons d'exemple
INSERT INTO coupons (code, name, description, type, value, min_amount, usage_limit, status, start_date, end_date)
VALUES 
    ('WELCOME10', 'Bienvenue 10%', 'Réduction de bienvenue pour nouveaux clients', 'percentage', 10, 5000, 100, 'active', NOW(), NOW() + INTERVAL '1 year'),
    ('FREESHIP', 'Livraison gratuite', 'Livraison gratuite pour commandes > 25000 FCFA', 'free_shipping', 0, 25000, 0, 'active', NOW(), NOW() + INTERVAL '1 year'),
    ('SAVE5000', 'Économisez 5000 FCFA', 'Réduction fixe de 5000 FCFA', 'fixed', 5000, 15000, 50, 'active', NOW(), NOW() + INTERVAL '6 months')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- FIN DES REQUÊTES SQL
-- =====================================================