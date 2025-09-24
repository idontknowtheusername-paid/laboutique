-- Script pour créer manuellement un vendeur par défaut
-- Exécuter dans Supabase SQL Editor

-- 1. Vérifier s'il existe déjà des vendeurs
SELECT COUNT(*) as vendor_count FROM vendors;

-- 2. Créer un vendeur par défaut si aucun n'existe
INSERT INTO vendors (
    name, 
    slug, 
    email, 
    status
) 
SELECT 
    'Vendeur par défaut', 
    'vendeur-defaut', 
    'default@laboutique.bj', 
    'active'
WHERE NOT EXISTS (
    SELECT 1 FROM vendors LIMIT 1
) 
RETURNING id, name, slug, email, status;

-- 3. Vérifier le résultat
SELECT id, name, slug, email, status, created_at
FROM vendors 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Si la création échoue, vérifier les colonnes requises
-- (Décommentez si nécessaire)

-- ALTER TABLE vendors ADD COLUMN IF NOT EXISTS name VARCHAR(255);
-- ALTER TABLE vendors ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
-- ALTER TABLE vendors ADD COLUMN IF NOT EXISTS email VARCHAR(255);
-- ALTER TABLE vendors ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- 5. Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'vendors';

-- 6. Désactiver temporairement RLS si nécessaire (ATTENTION: à réactiver après)
-- ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;

-- 7. Réactiver RLS après création du vendeur
-- ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;