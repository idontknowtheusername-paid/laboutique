-- Vérifier la création des sessions

-- 1. Compter les sessions
SELECT COUNT(*) as total_sessions FROM analytics_sessions;

-- 2. Si 0 sessions, vérifier les erreurs potentielles
-- Vérifier la structure de la table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'analytics_sessions'
ORDER BY ordinal_position;

-- 3. Essayer de créer une session manuellement pour tester
INSERT INTO analytics_sessions (
  session_id,
  visitor_id,
  user_agent,
  browser,
  os,
  device_type,
  ip_address,
  timezone,
  referrer,
  referrer_domain
) VALUES (
  'test-session-' || gen_random_uuid()::text,
  'test-visitor-' || gen_random_uuid()::text,
  'Mozilla/5.0 Test',
  'Chrome',
  'MacOS',
  'desktop',
  '127.0.0.1',
  'Africa/Porto-Novo',
  '',
  null
) RETURNING id, session_id, visitor_id;
