#!/usr/bin/env node

/**
 * Test de récupération d'un produit spécifique par ID
 */

async function testSingleProduct() {
  try {
    console.log('🧪 Test récupération produit par ID...\n');

    // IDs de produits AliExpress populaires à tester
    const productIds = [
      '1005006265991998', // Exemple de produit
      '1005005969726397',
      '1005006123456789'
    ];

    for (const productId of productIds) {
      console.log(`📦 Test produit ID: ${productId}`);
      
      const response = await fetch(`http://localhost:3000/api/products/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `https://www.aliexpress.com/item/${productId}.html`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`   ✅ Produit trouvé: ${data.product.name.slice(0, 50)}...`);
        console.log(`   💰 Prix: ${data.product.price} XOF`);
        console.log(`   🖼️  Images: ${data.product.images.length}`);
      } else {
        console.log(`   ❌ Erreur: ${data.error}`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testSingleProduct();
