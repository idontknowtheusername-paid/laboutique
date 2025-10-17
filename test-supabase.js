#!/usr/bin/env node

// Test de connexion Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 DIAGNOSTIC SUPABASE\n');

console.log('Variables d\'environnement:');
console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Définie' : '❌ Manquante'}`);
console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Définie' : '❌ Manquante'}`);
console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? '✅ Définie' : '❌ Manquante'}`);

if (supabaseUrl && supabaseAnonKey) {
  console.log('\n🔗 Test de connexion Supabase...');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Test simple de connexion
  supabase
    .from('newsletters')
    .select('count')
    .then(({ data, error }) => {
      if (error) {
        console.log(`❌ Erreur de connexion: ${error.message}`);
      } else {
        console.log('✅ Connexion Supabase réussie !');
      }
    })
    .catch(err => {
      console.log(`❌ Erreur: ${err.message}`);
    });
} else {
  console.log('\n❌ Variables d\'environnement manquantes');
  console.log('💡 Configurez vos vraies clés Supabase dans .env.local');
}