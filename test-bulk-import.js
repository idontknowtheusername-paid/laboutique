// Script de test pour l'import en masse
// Usage: node test-bulk-import.js

const testBulkImport = async () => {
  const baseUrl = 'http://localhost:3000';
  
  // Test 1: Recherche simple
  const testData = {
    keywords: 'phone case',
    min_price: 1,
    max_price: 20,
    sort: 'sales_desc',
    limit: 5 // Petit test avec 5 produits
  };

  console.log('🧪 Test de l\'import en masse...');
  console.log('Données de test:', testData);

  try {
    const response = await fetch(`${baseUrl}/api/products/import/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Test réussi !');
      console.log('Résultats:', result);
      
      if (result.results) {
        console.log(`📊 Statistiques:`);
        console.log(`   - Trouvés: ${result.results.total_found}`);
        console.log(`   - Importés: ${result.results.imported}`);
        console.log(`   - Échecs: ${result.results.failed}`);
        
        if (result.results.imported_products.length > 0) {
          console.log(`📦 Produits importés:`);
          result.results.imported_products.forEach((p, i) => {
            console.log(`   ${i+1}. ${p.name} (${p.price} XOF)`);
          });
        }
      }
    } else {
      console.log('❌ Test échoué');
      console.log('Erreur:', result);
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
  }
};

// Lancer le test
testBulkImport();