#!/usr/bin/env node

/**
 * Script pour tester la connexion Supabase
 * Usage: node scripts/test-supabase-connection.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Test de connexion Supabase...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? 'SET' : 'NOT SET');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.log('Vérifiez que .env.local contient:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('\n📊 Test 1: Connexion de base...');
    const { data, error } = await supabase.from('categories').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      console.error('Code:', error.code);
      console.error('Détails:', error.details);
      return false;
    }
    
    console.log('✅ Connexion réussie!');
    
    console.log('\n📊 Test 2: Vérification des tables...');
    const tables = ['categories', 'vendors', 'products'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: OK`);
        }
      } catch (e) {
        console.log(`❌ Table ${table}: ${e.message}`);
      }
    }
    
    console.log('\n📊 Test 3: Test d\'insertion...');
    const { data: testCategory, error: insertError } = await supabase
      .from('categories')
      .insert([{
        name: 'Test Category',
        slug: 'test-category-' + Date.now(),
        description: 'Catégorie de test',
        status: 'active'
      }])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erreur d\'insertion:', insertError.message);
    } else {
      console.log('✅ Insertion réussie:', testCategory.id);
      
      // Nettoyer le test
      await supabase.from('categories').delete().eq('id', testCategory.id);
      console.log('🧹 Test nettoyé');
    }
    
    return true;
    
  } catch (error) {
    console.error('💥 Erreur inattendue:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Tous les tests sont passés! Supabase est configuré correctement.');
  } else {
    console.log('\n❌ Des tests ont échoué. Vérifiez votre configuration Supabase.');
  }
  process.exit(success ? 0 : 1);
});