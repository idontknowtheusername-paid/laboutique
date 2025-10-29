// Test RÉEL des feeds AliExpress
const testFeeds = async () => {
  console.log('🔍 TEST RÉALITÉ : Est-ce que les feeds retournent des produits ?');
  console.log('================================================================');

  const feeds = ['ds-bestselling', 'ds-new-arrival', 'ds-promotion', 'ds-choice', 'ds-plus'];
  
  for (const feed of feeds) {
    console.log(`\n📋 Test feed: ${feed}`);
    console.log('----------------------------');
    
    try {
      const response = await fetch('http://localhost:3000/api/aliexpress/test-single-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feed_name: feed })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${feed}: ${result.productCount} produits trouvés`);
        if (result.productCount > 0) {
          console.log(`   Premier produit: ${result.firstProduct?.title || 'N/A'}`);
        }
      } else {
        console.log(`❌ ${feed}: ${result.error}`);
      }
    } catch (error) {
      console.log(`💥 ${feed}: Erreur - ${error.message}`);
    }
  }
  
  console.log('\n🏁 Test terminé');
};

testFeeds();