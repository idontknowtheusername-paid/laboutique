#!/usr/bin/env node

/**
 * Script pour tester la requête des produits importés
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Test de la requête des produits importés...');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? 'SET' : 'NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testImportedProductsQuery() {
  try {
    console.log('\n📊 Test de la requête des produits importés...');
    
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        short_description,
        price,
        compare_price,
        images,
        status,
        featured,
        source_platform,
        source_url,
        created_at,
        category:categories(id, name, slug),
        vendor:vendors(id, name, slug)
      `)
      .in('source_platform', ['alibaba', 'aliexpress'])
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20);
    
    console.log('📊 Résultat de la requête:');
    console.log('- Produits trouvés:', products?.length || 0);
    console.log('- Erreur:', error ? error.message : 'Aucune');
    
    if (error) {
      console.error('❌ Erreur détaillée:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    } else if (products && products.length > 0) {
      console.log('✅ Produits importés trouvés:');
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} (${product.source_platform})`);
      });
    } else {
      console.log('ℹ️ Aucun produit importé trouvé');
      
      // Vérifions s'il y a des produits avec source_platform
      console.log('\n🔍 Vérification des produits avec source_platform...');
      const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('id, name, source_platform, status')
        .limit(10);
      
      if (allError) {
        console.error('❌ Erreur lors de la vérification:', allError.message);
      } else {
        console.log('📊 Tous les produits:');
        allProducts?.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name} - source: ${product.source_platform || 'null'} - status: ${product.status}`);
        });
      }
    }
    
  } catch (error) {
    console.error('💥 Erreur inattendue:', error.message);
  }
}

testImportedProductsQuery().then(() => {
  console.log('\n✅ Test terminé');
  process.exit(0);
});