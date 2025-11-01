-- SOLUTION TEMPORAIRE : Désactiver RLS pour débloquer le checkout
-- ⚠️ À RÉACTIVER APRÈS AVOIR TESTÉ LE CHECKOUT

-- Désactiver RLS temporairement
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist DISABLE ROW LEVEL SECURITY;

-- Vérifier que RLS est désactivé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('cart_items', 'profiles', 'wishlist');

-- ========================================
-- SCRIPT POUR RÉACTIVER RLS APRÈS TEST
-- ========================================
-- ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;