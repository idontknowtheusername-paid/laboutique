// Test d'AUTRES méthodes API AliExpress Dropship
const testOtherMethods = async () => {
  console.log('🔬 TEST AUTRES MÉTHODES API ALIEXPRESS DROPSHIP');
  console.log('===============================================');

  const methods = [
    'aliexpress.ds.product.search',
    'aliexpress.ds.category.product.get', 
    'aliexpress.ds.product.list',
    'aliexpress.ds.hotproduct.query',
    'aliexpress.ds.product.query'
  ];

  for (const method of methods) {
    console.log(`\n🧪 Test méthode: ${method}`);
    console.log('----------------------------');
    
    try {
      const response = await fetch('http://localhost:3000/api/aliexpress/test-other-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          method: method,
          params: {
            category_id: '200000343',
            keywords: 'phone',
            page_size: 5
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${method}: Fonctionne`);
        if (result.productCount > 0) {
          console.log(`   📦 ${result.productCount} produits trouvés!`);
        } else {
          console.log(`   📭 0 produits (mais méthode valide)`);
        }
      } else {
        console.log(`❌ ${method}: ${result.error}`);
      }
    } catch (error) {
      console.log(`💥 ${method}: Erreur - ${error.message}`);
    }
  }
  
  console.log('\n🏁 Test des autres méthodes terminé');
};

testOtherMethods();