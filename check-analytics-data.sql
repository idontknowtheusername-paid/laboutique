-- Vérifier les données analytics dans Supabase

-- 1. Compter les sessions
SELECT COUNT(*) as total_sessions FROM analytics_sessions;

-- 2. Compter les visiteurs uniques
SELECT COUNT(DISTINCT visitor_id) as unique_visitors FROM analytics_sessions;

-- 3. Voir les sources de trafic
SELECT 
  COALESCE(utm_source, 'Direct') as source,
  COUNT(DISTINCT visitor_id) as visitors,
  COUNT(*) as sessions
FROM analytics_sessions
GROUP BY utm_source
ORDER BY visitors DESC;

-- 4. Voir les referrers
SELECT 
  referrer_domain,
  COUNT(DISTINCT visitor_id) as visitors
FROM analytics_sessions
WHERE referrer_domain IS NOT NULL
GROUP BY referrer_domain
ORDER BY visitors DESC
LIMIT 10;

-- 5. Vérifier les visiteurs actifs
SELECT * FROM v_active_visitors;

-- 6. Vérifier les pages vues
SELECT COUNT(*) as total_pageviews FROM analytics_page_views;
