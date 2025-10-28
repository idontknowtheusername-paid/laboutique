-- Corriger l'expiration du token AliExpress
-- Les tokens AliExpress durent 30 jours, pas 24h !

UPDATE aliexpress_oauth_tokens
SET expires_at = NOW() + INTERVAL '30 days'
WHERE access_token = '50000200a38OmG7gApzuUDh3kUCjQZvSCckgUeoSVEJDypxEVU16567057PwKYy65YY2';

-- Vérifier le résultat
SELECT 
  '✅ Token mis à jour' as status,
  expires_at,
  NOW() as current_time,
  expires_at - NOW() as time_remaining
FROM aliexpress_oauth_tokens
ORDER BY created_at DESC
LIMIT 1;
