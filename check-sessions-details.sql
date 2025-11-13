-- Vérifier les sessions en détail

-- 1. Compter les sessions
SELECT COUNT(*) as total_sessions FROM analytics_sessions;

-- 2. Voir toutes les sessions avec leurs sources
SELECT 
  id,
  visitor_id,
  utm_source,
  referrer,
  referrer_domain,
  started_at,
  device_type
FROM analytics_sessions
ORDER BY started_at DESC
LIMIT 20;

-- 3. Compter les visiteurs uniques
SELECT COUNT(DISTINCT visitor_id) as unique_visitors 
FROM analytics_sessions;

-- 4. Vérifier les pages vues avec visitor_id
SELECT 
  visitor_id,
  page_path,
  page_title,
  viewed_at
FROM analytics_page_views
ORDER BY viewed_at DESC
LIMIT 10;
