// Test de diagnostic de l'API AliExpress
const testApiDiagnosis = async () => {
  console.log('🔍 DIAGNOSTIC API ALIEXPRESS');
  console.log('============================');

  const baseUrl = 'http://localhost:3000';

  // Test 1: Vérifier l'authentification
  console.log('\n🔐 Test 1: Authentification OAuth');
  console.log('----------------------------------');

  try {
    const response = await fetch(`${baseUrl}/api/aliexpress/test-single-feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feed_name: 'ds-bestselling' })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Authentification OK`);
      console.log(`   Feed: ${result.feed_name}`);
      console.log(`   Produits trouvés: ${result.productCount}`);
      
      if (result.productCount > 0) {
        console.log(`   Premier produit: ${result.firstProduct?.title || 'N/A'}`);
      } else {
        console.log(`   ⚠️  Aucun produit retourné par l'API`);
      }
    } else {
      console.log(`❌ Authentification échouée: ${result.error}`);
    }
  } catch (error) {
    console.log(`💥 Erreur d'authentification: ${error.message}`);
  }

  // Test 2: Tester différents feeds
  console.log('\n📋 Test 2: Différents feeds');
  console.log('----------------------------');

  const feeds = ['ds-bestselling', 'ds-new-arrival', 'ds-promotion', 'ds-choice'];
  
  for (const feed of feeds) {
    try {
      const response = await fetch(`${baseUrl}/api/aliexpress/test-single-feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feed_name: feed })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${feed}: ${result.productCount} produits`);
      } else {
        console.log(`❌ ${feed}: ${result.error}`);
      }
    } catch (error) {
      console.log(`💥 ${feed}: ${error.message}`);
    }
  }

  // Test 3: Tester l'ancienne méthode getProductsFromMultipleFeeds
  console.log('\n🔄 Test 3: Méthode getProductsFromMultipleFeeds');
  console.log('-----------------------------------------------');

  try {
    const response = await fetch(`${baseUrl}/api/products/import/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feed_type: 'mixed', limit: 1 })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Méthode mixte: ${result.results.total_found} produits trouvés`);
    } else {
      console.log(`❌ Méthode mixte: ${result.error}`);
    }
  } catch (error) {
    console.log(`💥 Méthode mixte: ${error.message}`);
  }

  // Test 4: Système de tags (indépendant de l'API)
  console.log('\n🏷️  Test 4: Système de tags (fonctionne toujours)');
  console.log('--------------------------------------------------');

  const testProducts = [
    'iPhone 15 Pro Max Case',
    'Wireless Bluetooth Headphones',
    'Women Summer Dress Cotton',
    'Kitchen Knife Set Steel'
  ];

  for (const productName of testProducts) {
    try {
      const response = await fetch(`${baseUrl}/api/products/test-tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: productName, feed_type: 'ds-bestselling' })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${productName}`);
        console.log(`   Catégorie: ${result.analysis.suggested_category || 'Aucune'}`);
        console.log(`   Tags: ${result.analysis.tags.slice(0, 3).map(t => t.name).join(', ')}`);
      } else {
        console.log(`❌ ${productName}: ${result.error}`);
      }
    } catch (error) {
      console.log(`💥 ${productName}: ${error.message}`);
    }
  }

  console.log('\n🏁 Diagnostic terminé !');
  console.log('\n💡 Conclusions:');
  console.log('   1. Si authentification OK mais 0 produits → Problème temporaire AliExpress');
  console.log('   2. Si authentification échoue → Problème de configuration OAuth');
  console.log('   3. Le système de tags fonctionne indépendamment de l\'API');
  console.log('   4. L\'interface utilisateur est améliorée même sans produits AliExpress');
};

// Lancer le diagnostic
testApiDiagnosis();