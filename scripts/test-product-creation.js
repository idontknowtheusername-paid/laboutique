#!/usr/bin/env node

/**
 * Script pour tester la création de produits
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 Test de création de produit...');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testProductCreation() {
  try {
    console.log('\n📊 Test 1: Vérification des vendeurs...');
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('id, name')
      .limit(3);
    
    if (vendorsError) {
      console.error('❌ Erreur vendeurs:', vendorsError.message);
      return;
    }
    
    console.log('✅ Vendeurs disponibles:', vendors?.length || 0);
    vendors?.forEach((v, i) => console.log(`  ${i+1}. ${v.name} (${v.id})`));
    
    console.log('\n📊 Test 2: Vérification des catégories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(3);
    
    if (categoriesError) {
      console.error('❌ Erreur catégories:', categoriesError.message);
      return;
    }
    
    console.log('✅ Catégories disponibles:', categories?.length || 0);
    categories?.forEach((c, i) => console.log(`  ${i+1}. ${c.name} (${c.id})`));
    
    if (!vendors || vendors.length === 0 || !categories || categories.length === 0) {
      console.error('❌ Pas de vendeurs ou catégories disponibles');
      return;
    }
    
    console.log('\n📊 Test 3: Création d\'un produit test...');
    const testProduct = {
      name: 'Test Produit Manuel - ' + Date.now(),
      slug: 'test-produit-manuel-' + Date.now(),
      sku: 'TEST-' + Date.now(),
      price: 50000,
      vendor_id: vendors[0].id,
      category_id: categories[0].id,
      status: 'active',
      description: 'Produit de test créé manuellement',
      short_description: 'Test manuel',
      track_quantity: true,
      quantity: 10
    };
    
    const { data: newProduct, error: createError } = await supabase
      .from('products')
      .insert([testProduct])
      .select('id, name, price, status')
      .single();
    
    if (createError) {
      console.error('❌ Erreur création produit:', createError.message);
      console.error('Détails:', createError.details);
    } else {
      console.log('✅ Produit créé avec succès:', {
        id: newProduct.id,
        name: newProduct.name,
        price: newProduct.price,
        status: newProduct.status
      });
      
      // Nettoyer le test
      await supabase.from('products').delete().eq('id', newProduct.id);
      console.log('🧹 Test nettoyé');
    }
    
  } catch (error) {
    console.error('💥 Erreur inattendue:', error.message);
  }
}

testProductCreation().then(() => {
  console.log('\n✅ Test terminé');
  process.exit(0);
});