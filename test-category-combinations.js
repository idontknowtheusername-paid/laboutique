// Test EXHAUSTIF : Catégories + Paramètres + Filtres
const testCategoryCombinations = async () => {
  console.log('🔬 TEST EXHAUSTIF : Catégories + Tous les paramètres possibles');
  console.log('================================================================');

  // Catégories populaires à tester
  const categories = [
    { id: '200000343', name: 'Men\'s Clothing' },
    { id: '200000345', name: 'Women\'s Clothing' },
    { id: '200000297', name: 'Apparel Accessories' },
    { id: '509', name: 'Phones & Telecommunications' },
    { id: '44', name: 'Consumer Electronics' }
  ];

  const feeds = ['ds-bestselling', 'ds-new-arrival', 'ds-promotion'];
  
  // Test 1: Catégories seules
  console.log('\n📋 TEST 1: Catégories avec feeds');
  for (const category of categories) {
    for (const feed of feeds) {
      console.log(`\n🔍 ${category.name} (${category.id}) + ${feed}`);
      
      try {
        const response = await fetch('http://localhost:3000/api/aliexpress/test-category-feed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category_id: category.id,
            feed_name: feed,
            page_size: 10
          })
        });

        const result = await response.json();
        console.log(`   Résultat: ${result.productCount || 0} produits`);
        
        if (result.productCount > 0) {
          console.log(`   ✅ SUCCÈS! Premier produit: ${result.firstProduct?.title}`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
      }
    }
  }

  // Test 2: Paramètres de prix
  console.log('\n📋 TEST 2: Filtres de prix');
  const priceRanges = [
    { min: 1, max: 10 },
    { min: 10, max: 50 },
    { min: 50, max: 100 }
  ];

  for (const range of priceRanges) {
    console.log(`\n💰 Prix ${range.min}-${range.max} USD`);
    
    try {
      const response = await fetch('http://localhost:3000/api/aliexpress/test-category-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feed_name: 'ds-bestselling',
          min_price: range.min,
          max_price: range.max,
          page_size: 10
        })
      });

      const result = await response.json();
      console.log(`   Résultat: ${result.productCount || 0} produits`);
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
  }

  // Test 3: Différents pays
  console.log('\n📋 TEST 3: Différents pays de livraison');
  const countries = ['US', 'FR', 'CN', 'GB', 'DE', 'BJ'];

  for (const country of countries) {
    console.log(`\n🌍 Pays: ${country}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/aliexpress/test-category-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feed_name: 'ds-bestselling',
          ship_to_country: country,
          page_size: 10
        })
      });

      const result = await response.json();
      console.log(`   Résultat: ${result.productCount || 0} produits`);
      
      if (result.productCount > 0) {
        console.log(`   ✅ SUCCÈS avec ${country}!`);
      }
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
  }

  console.log('\n🏁 Test exhaustif terminé');
};

testCategoryCombinations();