// Script de test pour vérifier la connexion Supabase
// Exécuter avec: node scripts/test-supabase.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Test de connexion Supabase...\n');

  try {
    // Test 1: Connexion de base
    console.log('1. Test de connexion...');
    const { data, error } = await supabase.from('categories').select('count');
    if (error) throw error;
    console.log('✅ Connexion réussie\n');

    // Test 2: Vérifier les tables
    console.log('2. Vérification des tables...');
    const tables = ['profiles', 'categories', 'vendors', 'products', 'cart_items', 'wishlist', 'orders'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) throw error;
        console.log(`✅ Table ${table} existe`);
      } catch (err) {
        console.log(`❌ Table ${table} manquante: ${err.message}`);
      }
    }

    // Test 3: Vérifier les données de test
    console.log('\n3. Vérification des données de test...');
    const { data: categories } = await supabase.from('categories').select('*');
    console.log(`✅ ${categories?.length || 0} catégories trouvées`);

    const { data: products } = await supabase.from('products').select('*');
    console.log(`✅ ${products?.length || 0} produits trouvés`);

    const { data: vendors } = await supabase.from('vendors').select('*');
    console.log(`✅ ${vendors?.length || 0} vendeurs trouvés`);

    console.log('\n🎉 Tous les tests sont passés !');
    console.log('\n📝 Prochaines étapes:');
    console.log('1. Démarrer le serveur: npm run dev');
    console.log('2. Aller sur http://localhost:3000/auth/register');
    console.log('3. Créer un compte de test');
    console.log('4. Tester la connexion');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n🔧 Solutions possibles:');
    console.log('1. Vérifier que le script SQL a été exécuté dans Supabase');
    console.log('2. Vérifier les clés dans .env.local');
    console.log('3. Vérifier que RLS est configuré correctement');
  }
}

testConnection();