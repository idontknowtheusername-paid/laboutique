/**
 * Test complet de l'import par catégorie AliExpress
 * 1. Récupère les catégories
 * 2. Sélectionne une catégorie (ex: Électronique)
 * 3. Récupère les IDs de produits de cette catégorie
 * 4. Récupère les détails des produits
 */

require('dotenv').config({ path: '.env.local' });

async function testCategoryImport() {
  console.log('\n🔍 Test complet de l\'import par catégorie AliExpress\n');
  console.log('='.repeat(70));
  
  try {
    // ÉTAPE 1: Récupérer les catégories
    console.log('\n📂 ÉTAPE 1: Récupération des catégories AliExpress...\n');
    
    const categoriesResponse = await fetch('http://localhost:3000/api/aliexpress/test-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'fr' })
    });
    
    const categoriesData = await categoriesResponse.json();
    
    if (!categoriesData.success || !categoriesData.categories) {
      console.log('❌ Impossible de récupérer les catégories');
      return;
    }
    
    console.log(`✅ ${categoriesData.categories.length} catégories trouvées`);
    
    // Afficher quelques catégories intéressantes
    const interestingCategories = categoriesData.categories.filter(cat => 
      cat.category_name.toLowerCase().includes('électronique') ||
      cat.category_name.toLowerCase().includes('phone') ||
      cat.category_name.toLowerCase().includes('computer') ||
      cat.category_name.toLowerCase().includes('fashion') ||
      cat.category_name.toLowerCase().includes('mode')
    ).slice(0, 10);
    
    console.log('\n📋 Catégories disponibles pour le test:');
    interestingCategories.forEach((cat, i) => {
      console.log(`   ${i + 1}. ${cat.category_name} (ID: ${cat.category_id})`);
    });
    
    // ÉTAPE 2: Sélectionner une catégorie pour le test
    const testCategory = interestingCategories[0] || categoriesData.categories[0];
    console.log(`\n🎯 Catégorie sélectionnée pour le test: "${testCategory.category_name}" (ID: ${testCategory.category_id})`);
    
    // ÉTAPE 3: Tester l'API feed.itemids.get avec cette catégorie
    console.log('\n📡 ÉTAPE 2: Récupération des IDs de produits...\n');
    
    const itemIdsResponse = await fetch('http://localhost:3000/api/aliexpress/test-feed-itemids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_id: testCategory.category_id,
        feed_name: 'ds-bestselling',
        page_size: 10
      })
    });
    
    const itemIdsData = await itemIdsResponse.json();
    
    console.log('Réponse de l\'API feed.itemids.get:');
    console.log(JSON.stringify(itemIdsData, null, 2).substring(0, 1000));
    
    if (itemIdsData.success && itemIdsData.product_ids && itemIdsData.product_ids.length > 0) {
      console.log(`\n✅ ${itemIdsData.product_ids.length} IDs de produits récupérés !`);
      console.log('IDs:', itemIdsData.product_ids.slice(0, 5).join(', '), '...');
      
      // ÉTAPE 4: Récupérer les détails de quelques produits
      console.log('\n📦 ÉTAPE 3: Récupération des détails des produits...\n');
      
      const productDetailsPromises = itemIdsData.product_ids.slice(0, 3).map(async (productId) => {
        try {
          const response = await fetch('http://localhost:3000/api/aliexpress/product-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId })
          });
          return await response.json();
        } catch (error) {
          return { success: false, error: error.message };
        }
      });
      
      const productsDetails = await Promise.all(productDetailsPromises);
      
      productsDetails.forEach((product, i) => {
        if (product.success && product.product) {
          console.log(`   ${i + 1}. ${product.product.product_title.substring(0, 60)}...`);
          console.log(`      Prix: ${product.product.sale_price} USD`);
          console.log(`      ID: ${product.product.product_id}`);
        } else {
          console.log(`   ${i + 1}. ❌ Erreur: ${product.error || 'Produit non disponible'}`);
        }
      });
      
      // RÉSUMÉ
      console.log('\n' + '='.repeat(70));
      console.log('✅ TEST RÉUSSI ! L\'import par catégorie fonctionne !');
      console.log('='.repeat(70));
      console.log('\n💡 Prochaines étapes:');
      console.log('   1. Créer une interface admin pour sélectionner les catégories');
      console.log('   2. Implémenter l\'import automatique par catégorie');
      console.log('   3. Permettre l\'import de 50-100 produits par catégorie');
      
    } else {
      console.log('\n⚠️  Aucun ID de produit trouvé pour cette catégorie');
      console.log('   Cela peut signifier que:');
      console.log('   - Cette catégorie n\'a pas de produits dans le feed');
      console.log('   - L\'API feed.itemids.get ne supporte pas les categoryId');
      console.log('   - Il faut utiliser une autre approche');
      
      console.log('\n💡 Solution alternative:');
      console.log('   Utiliser le web scraping pour récupérer les URLs de produits');
      console.log('   par catégorie, puis les importer via ton système existant.');
    }
    
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error('\n💡 Vérifiez que:');
    console.error('   1. Le serveur Next.js est démarré');
    console.error('   2. Les routes API sont créées');
    console.error('   3. Les credentials AliExpress sont valides');
  }
  
  console.log('\n');
}

// Exécuter le test
testCategoryImport();
