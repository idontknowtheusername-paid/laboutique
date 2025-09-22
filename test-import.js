// Script de test pour vérifier l'import de produits
const testImport = async () => {
  try {
    console.log('🧪 Test de l\'import de produits...');
    
    // URL de test AliExpress (exemple)
    const testUrl = 'https://www.aliexpress.com/item/1005001234567890.html';
    
    const response = await fetch('http://localhost:3000/api/products/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: testUrl,
        importDirectly: true
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Import réussi:', result);
    } else {
      console.log('❌ Erreur d\'import:', result);
    }
    
    // Vérifier que le produit apparaît dans la liste
    const productsResponse = await fetch('http://localhost:3000/api/products?limit=50');
    const productsResult = await productsResponse.json();
    
    if (productsResult.success) {
      const importedProducts = productsResult.data.filter(p => 
        p.source_platform === 'aliexpress' || p.source_platform === 'alibaba'
      );
      console.log(`📦 Produits importés trouvés: ${importedProducts.length}`);
      console.log('Produits:', importedProducts.map(p => ({ 
        name: p.name, 
        status: p.status, 
        category: p.category?.name || 'Sans catégorie',
        platform: p.source_platform 
      })));
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
};

// Exécuter le test si le script est appelé directement
if (typeof window === 'undefined') {
  testImport();
}

module.exports = { testImport };
