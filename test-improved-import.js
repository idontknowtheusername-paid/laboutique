// Test du système d'import amélioré avec tags automatiques
const testImprovedImport = async () => {
  console.log('🚀 TEST DU SYSTÈME D\'IMPORT AMÉLIORÉ');
  console.log('=====================================');

  const baseUrl = 'http://localhost:3000';

  // Test 1: Tester le système de tags
  console.log('\n📋 Test 1: Système de tags automatiques');
  console.log('----------------------------------------');

  const testProducts = [
    { name: 'iPhone 15 Pro Max Case Leather Black', feed_type: 'ds-bestselling' },
    { name: 'Wireless Bluetooth Headphones Sony', feed_type: 'ds-new-arrival' },
    { name: 'Women Summer Dress Cotton Blue', feed_type: 'ds-promotion' },
    { name: 'Kitchen Knife Set Stainless Steel', feed_type: 'ds-choice' },
    { name: 'Gaming Mouse RGB LED Wireless', feed_type: 'mixed' }
  ];

  for (const product of testProducts) {
    try {
      const response = await fetch(`${baseUrl}/api/products/test-tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: product.name,
          feed_type: product.feed_type
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${product.name}`);
        console.log(`   Feed: ${result.feed_type}`);
        console.log(`   Catégorie suggérée: ${result.analysis.suggested_category || 'Aucune'}`);
        console.log(`   Confiance: ${Math.round(result.analysis.confidence * 100)}%`);
        console.log(`   Tags principaux: ${result.analysis.tags.slice(0, 3).map(t => `${t.name} (${Math.round(t.confidence * 100)}%)`).join(', ')}`);
        console.log(`   Catégorie sélectionnée: ${result.analysis.selected_category?.name || 'Défaut'}`);
      } else {
        console.log(`❌ ${product.name}: ${result.error}`);
      }
    } catch (error) {
      console.log(`💥 ${product.name}: Erreur - ${error.message}`);
    }
    console.log('');
  }

  // Test 2: Import réel avec le nouveau système
  console.log('\n📦 Test 2: Import en masse avec tags');
  console.log('------------------------------------');

  const importTests = [
    { feed_type: 'mixed', limit: 3, description: 'Mélange varié (3 produits)' },
    { feed_type: 'ds-bestselling', limit: 2, description: 'Meilleures ventes (2 produits)' }
  ];

  for (const test of importTests) {
    console.log(`\n🔄 Test: ${test.description}`);
    
    try {
      const response = await fetch(`${baseUrl}/api/products/import/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Import réussi !`);
        console.log(`   Feed: ${result.feed_type}`);
        console.log(`   Trouvés: ${result.results.total_found}`);
        console.log(`   Importés: ${result.results.imported}`);
        console.log(`   Échecs: ${result.results.failed}`);
        
        if (result.results.imported_products.length > 0) {
          console.log(`   Produits importés:`);
          result.results.imported_products.forEach((p, i) => {
            console.log(`     ${i+1}. ${p.name} (${p.price} XOF)`);
          });
        }

        if (result.results.errors.length > 0) {
          console.log(`   Erreurs: ${result.results.errors.slice(0, 2).join(', ')}`);
        }
      } else {
        console.log(`❌ Import échoué: ${result.error}`);
      }
    } catch (error) {
      console.log(`💥 Erreur d'import: ${error.message}`);
    }
  }

  // Test 3: Génération d'URLs avec nouveau système
  console.log('\n🔗 Test 3: Génération d\'URLs améliorée');
  console.log('---------------------------------------');

  const urlTests = [
    { feed_type: 'mixed', count: 5 },
    { feed_type: 'ds-promotion', count: 3 }
  ];

  for (const test of urlTests) {
    try {
      const response = await fetch(`${baseUrl}/api/products/generate-urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Feed ${test.feed_type}: ${result.count} URLs générées`);
        console.log(`   Première URL: ${result.urls[0]?.substring(0, 60)}...`);
      } else {
        console.log(`❌ Feed ${test.feed_type}: ${result.error}`);
      }
    } catch (error) {
      console.log(`💥 Feed ${test.feed_type}: ${error.message}`);
    }
  }

  console.log('\n🏁 Tests terminés !');
  console.log('\n💡 Résumé des améliorations:');
  console.log('   ✅ Interface utilisateur clarifiée (feeds au lieu de catégories)');
  console.log('   ✅ Système de tags automatique intelligent');
  console.log('   ✅ Catégorisation améliorée basée sur l\'analyse du nom');
  console.log('   ✅ Descriptions enrichies avec informations du feed');
  console.log('   ✅ Mots-clés SEO générés automatiquement');
  console.log('   ✅ Support des feeds mixtes et spécifiques');
};

// Lancer les tests
testImprovedImport();
