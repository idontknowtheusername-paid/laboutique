-- TABLE 1: analytics_sessions
-- Description: Stocke les sessions des visiteurs

CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visitor_id TEXT NOT NULL,
  
  -- Informations de session
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  
  -- Informations techniques
  user_agent TEXT,
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  os_version TEXT,
  device_type TEXT,
  device_vendor TEXT,
  device_model TEXT,
  
  -- Informations géographiques
  ip_address TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  timezone TEXT,
  
  -- Informations de trafic
  referrer TEXT,
  referrer_domain TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  -- Métriques
  page_views_count INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour analytics_sessions
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor_id ON analytics_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id ON analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON analytics_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_device_type ON analytics_sessions(device_type);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_country ON analytics_sessions(country);

-- Commentaire
COMMENT ON TABLE analytics_sessions IS 'Stocke les sessions des visiteurs avec informations techniques et géographiques';



-- TABLE 1: analytics_sessions
-- Stocke les sessions des visiteurs

CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visitor_id TEXT NOT NULL,
  
  -- Informations de session
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  
  -- Informations techniques
  user_agent TEXT,
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  os_version TEXT,
  device_type TEXT,
  device_vendor TEXT,
  device_model TEXT,
  
  -- Informations géographiques
  ip_address TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  timezone TEXT,
  
  -- Informations de trafic
  referrer TEXT,
  referrer_domain TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  -- Métriques
  page_views_count INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_analytics_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX idx_analytics_sessions_visitor_id ON analytics_sessions(visitor_id);
CREATE INDEX idx_analytics_sessions_user_id ON analytics_sessions(user_id);
CREATE INDEX idx_analytics_sessions_started_at ON analytics_sessions(started_at DESC);
CREATE INDEX idx_analytics_sessions_device_type ON analytics_sessions(device_type);
CREATE INDEX idx_analytics_sessions_country ON analytics_sessions(country);

-- Commentaire
COMMENT ON TABLE analytics_sessions IS 'Stocke les sessions des visiteurs avec informations techniques et géographiques';


-- TABLE 2: analytics_page_views
-- Stocke chaque page vue avec métriques

CREATE TABLE IF NOT EXISTS analytics_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES analytics_sessions(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Informations de la page
  page_url TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  page_referrer TEXT,
  
  -- Métriques de temps
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_on_page_seconds INTEGER DEFAULT 0,
  
  -- Informations de scroll
  scroll_depth_percentage INTEGER DEFAULT 0,
  max_scroll_depth INTEGER DEFAULT 0,
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_analytics_page_views_session_id ON analytics_page_views(session_id);
CREATE INDEX idx_analytics_page_views_visitor_id ON analytics_page_views(visitor_id);
CREATE INDEX idx_analytics_page_views_user_id ON analytics_page_views(user_id);
CREATE INDEX idx_analytics_page_views_page_path ON analytics_page_views(page_path);
CREATE INDEX idx_analytics_page_views_viewed_at ON analytics_page_views(viewed_at DESC);

-- Commentaire
COMMENT ON TABLE analytics_page_views IS 'Stocke chaque page vue avec métriques de temps et scroll';


-- TABLE 3: analytics_active_visitors
-- Table pour tracking temps réel des visiteurs actifs

CREATE TABLE IF NOT EXISTS analytics_active_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES analytics_sessions(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Informations
  current_page_path TEXT,
  current_page_title TEXT,
  
  -- Heartbeat
  last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_analytics_active_visitors_session_id ON analytics_active_visitors(session_id);
CREATE INDEX idx_analytics_active_visitors_visitor_id ON analytics_active_visitors(visitor_id);
CREATE INDEX idx_analytics_active_visitors_last_heartbeat ON analytics_active_visitors(last_heartbeat_at DESC);

-- Contrainte unique pour éviter les doublons
CREATE UNIQUE INDEX idx_analytics_active_visitors_unique ON analytics_active_visitors(visitor_id);

-- Commentaire
COMMENT ON TABLE analytics_active_visitors IS 'Table temps réel pour tracking des visiteurs actifs (TTL 5 minutes)';


-- FONCTIONS ET TRIGGERS

-- Fonction pour nettoyer les visiteurs actifs inactifs (> 5 minutes)
CREATE OR REPLACE FUNCTION cleanup_inactive_visitors()
RETURNS void AS $$
BEGIN
  DELETE FROM analytics_active_visitors
  WHERE last_heartbeat_at < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour le timestamp updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour analytics_sessions
DROP TRIGGER IF EXISTS update_analytics_sessions_updated_at ON analytics_sessions;
CREATE TRIGGER update_analytics_sessions_updated_at
  BEFORE UPDATE ON analytics_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour analytics_active_visitors
DROP TRIGGER IF EXISTS update_analytics_active_visitors_updated_at ON analytics_active_visitors;
CREATE TRIGGER update_analytics_active_visitors_updated_at
  BEFORE UPDATE ON analytics_active_visitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- VUES POUR REQUÊTES RAPIDES

-- Vue 1: Visiteurs actifs (dernières 5 minutes)
CREATE OR REPLACE VIEW v_active_visitors AS
SELECT 
  COUNT(DISTINCT av.visitor_id) as count,
  COUNT(DISTINCT CASE WHEN av.user_id IS NOT NULL THEN av.user_id END) as authenticated_count,
  COUNT(DISTINCT CASE WHEN av.user_id IS NULL THEN av.visitor_id END) as anonymous_count
FROM analytics_active_visitors av
WHERE av.last_heartbeat_at > NOW() - INTERVAL '5 minutes';

-- Vue 2: Visiteurs 24h
CREATE OR REPLACE VIEW v_visitors_24h AS
SELECT 
  COUNT(DISTINCT s.visitor_id) as count,
  COUNT(DISTINCT CASE WHEN s.user_id IS NOT NULL THEN s.user_id END) as authenticated_count,
  COUNT(DISTINCT CASE WHEN s.user_id IS NULL THEN s.visitor_id END) as anonymous_count
FROM analytics_sessions s
WHERE s.started_at > NOW() - INTERVAL '24 hours';

-- Vue 3: Pages les plus vues (dernières 24h)
CREATE OR REPLACE VIEW v_top_pages_24h AS
SELECT 
  pv.page_path,
  pv.page_title,
  COUNT(*) as views,
  COUNT(DISTINCT pv.visitor_id) as unique_visitors,
  AVG(pv.time_on_page_seconds) as avg_time_on_page,
  AVG(pv.scroll_depth_percentage) as avg_scroll_depth
FROM analytics_page_views pv
WHERE pv.viewed_at > NOW() - INTERVAL '24 hours'
GROUP BY pv.page_path, pv.page_title
ORDER BY views DESC
LIMIT 50;

-- Vue 4: Sources de trafic (dernières 24h)
CREATE OR REPLACE VIEW v_traffic_sources_24h AS
SELECT 
  COALESCE(s.utm_source, s.referrer_domain, 'Direct') as source,
  COUNT(DISTINCT s.session_id) as sessions,
  COUNT(DISTINCT s.visitor_id) as visitors,
  AVG(s.duration_seconds) as avg_session_duration
FROM analytics_sessions s
WHERE s.started_at > NOW() - INTERVAL '24 hours'
GROUP BY COALESCE(s.utm_source, s.referrer_domain, 'Direct')
ORDER BY sessions DESC;

-- Vue 5: Appareils (dernières 24h)
CREATE OR REPLACE VIEW v_devices_24h AS
SELECT 
  s.device_type,
  COUNT(DISTINCT s.session_id) as sessions,
  COUNT(DISTINCT s.visitor_id) as visitors,
  ROUND(COUNT(DISTINCT s.session_id)::numeric * 100.0 / NULLIF(SUM(COUNT(DISTINCT s.session_id)) OVER (), 0), 2) as percentage
FROM analytics_sessions s
WHERE s.started_at > NOW() - INTERVAL '24 hours'
  AND s.device_type IS NOT NULL
GROUP BY s.device_type
ORDER BY sessions DESC;


-- POLITIQUES RLS (Row Level Security)

-- Activer RLS sur toutes les tables
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_active_visitors ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut insérer (pour le tracking)
CREATE POLICY "Allow public insert on sessions" ON analytics_sessions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public insert on page_views" ON analytics_page_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public insert/update on active_visitors" ON analytics_active_visitors
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Politique: Seuls les admins peuvent lire
CREATE POLICY "Allow admin read on sessions" ON analytics_sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admin read on page_views" ON analytics_page_views
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admin read on active_visitors" ON analytics_active_visitors
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
