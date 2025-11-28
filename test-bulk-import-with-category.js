#!/usr/bin/env node

/**
 * Test de l'import en masse avec filtrage par catégorie
 */

async function testBulkImport() {
  try {
    console.log('🧪 Test import en masse avec catégorie...\n');

    // Test 1: Import sans catégorie (devrait fonctionner)
    console.log('📦 Test 1: Import sans catégorie (ds-bestselling, 10 produits)');
    const response1 = await fetch('http://localhost:3000/api/products/import/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feed_type: 'ds-bestselling',
        limit: 10
      })
    });

    const result1 = await response1.json();
    console.log('Résultat:', result1.message);
    if (result1.results) {
      console.log(`   - Trouvés: ${result1.results.total_found}`);
      console.log(`   - Importés: ${result1.results.imported}`);
      console.log(`   - Échecs: ${result1.results.failed}`);
    }
    console.log('');

    // Test 2: Import avec catégorie "Computer & Office" (ID: 7)
    console.log('📦 Test 2: Import avec catégorie "Computer & Office" (ID: 7)');
    const response2 = await fetch('http://localhost:3000/api/products/import/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feed_type: 'ds-bestselling',
        category_id: '7',
        limit: 10
      })
    });

    const result2 = await response2.json();
    console.log('Résultat:', result2.message);
    if (result2.results) {
      console.log(`   - Trouvés: ${result2.results.total_found}`);
      console.log(`   - Importés: ${result2.results.imported}`);
      console.log(`   - Échecs: ${result2.results.failed}`);
      
      if (result2.results.imported_products && result2.results.imported_products.length > 0) {
        console.log('\n   Produits importés:');
        result2.results.imported_products.slice(0, 3).forEach(p => {
          console.log(`   - ${p.name.slice(0, 60)}...`);
        });
      }
    }
    console.log('');

    // Test 3: Import avec catégorie "Sports & Entertainment" (ID: 18)
    console.log('📦 Test 3: Import avec catégorie "Sports & Entertainment" (ID: 18)');
    const response3 = await fetch('http://localhost:3000/api/products/import/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feed_type: 'ds-new-arrival',
        category_id: '18',
        limit: 5
      })
    });

    const result3 = await response3.json();
    console.log('Résultat:', result3.message);
    if (result3.results) {
      console.log(`   - Trouvés: ${result3.results.total_found}`);
      console.log(`   - Importés: ${result3.results.imported}`);
      console.log(`   - Échecs: ${result3.results.failed}`);
    }

    console.log('\n✅ Tests terminés');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testBulkImport();
