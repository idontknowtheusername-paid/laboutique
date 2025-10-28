-- Vérifier que la table existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'aliexpress_oauth_tokens';

-- Vérifier que le token est bien inséré
SELECT 
  id,
  LEFT(access_token, 20) || '...' as access_token_preview,
  expires_at,
  token_type,
  created_at
FROM aliexpress_oauth_tokens
ORDER BY created_at DESC
LIMIT 1;

-- Vérifier si le token est encore valide
SELECT 
  CASE 
    WHEN expires_at > NOW() THEN '✅ Token valide'
    ELSE '❌ Token expiré'
  END as status,
  expires_at,
  NOW() as current_time,
  expires_at - NOW() as time_remaining
FROM aliexpress_oauth_tokens
ORDER BY created_at DESC
LIMIT 1;
