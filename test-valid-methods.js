// Test des méthodes OFFICIELLES de l'API Dropship
const testValidMethods = async () => {
  console.log('📚 TEST MÉTHODES OFFICIELLES API DROPSHIP');
  console.log('=========================================');

  // Méthodes officielles selon la documentation AliExpress Dropship
  const officialMethods = [
    'aliexpress.ds.recommend.feed.get',      // ✅ Déjà testé
    'aliexpress.ds.product.get',             // ✅ Fonctionne (produit individuel)
    'aliexpress.ds.category.get',            // ✅ Fonctionne (catégories)
    'aliexpress.ds.productreview.get',       // Reviews d'un produit
    'aliexpress.ds.commissionorder.listbyindex', // Commandes
    'aliexpress.ds.commissionorder.get',     // Détail commande
    'aliexpress.ds.trackinginfo.query',      // Tracking
    'aliexpress.ds.image.search'             // Recherche par image
  ];

  for (const method of officialMethods) {
    console.log(`\n🧪 Test méthode: ${method}`);
    
    let testParams = {};
    
    // Paramètres spécifiques par méthode
    switch (method) {
      case 'aliexpress.ds.productreview.get':
        testParams = { product_id: '1005007499493593' }; // Produit qu'on sait qui existe
        break;
      case 'aliexpress.ds.image.search':
        testParams = { image_url: 'https://ae01.alicdn.com/kf/S536b6a9ec3a9488d903a3d607ef934a7Y.jpg' };
        break;
      case 'aliexpress.ds.commissionorder.listbyindex':
        testParams = { start_time: '2024-01-01', end_time: '2024-12-31' };
        break;
      default:
        testParams = { page_size: 5 };
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/aliexpress/test-other-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          method: method,
          params: testParams
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${method}: FONCTIONNE`);
        if (result.productCount > 0) {
          console.log(`   📦 ${result.productCount} résultats!`);
        }
      } else if (result.isMethodError) {
        console.log(`❌ ${method}: Méthode non supportée`);
      } else {
        console.log(`⚠️ ${method}: ${result.error}`);
      }
    } catch (error) {
      console.log(`💥 ${method}: Erreur - ${error.message}`);
    }
  }
  
  console.log('\n🏁 Test des méthodes officielles terminé');
};

testValidMethods();