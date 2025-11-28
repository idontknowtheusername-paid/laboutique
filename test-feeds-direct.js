#!/usr/bin/env node

/**
 * Test direct des feeds AliExpress
 */

const { getAliExpressDropshipApiService } = require('./lib/services/aliexpress-dropship-api.service.ts');

async function testFeeds() {
  try {
    console.log('🧪 Test direct des feeds AliExpress...\n');

    const apiService = getAliExpressDropshipApiService();
    
    const feeds = ['ds-bestselling', 'ds-new-arrival', 'ds-promotion', 'ds-choice'];
    
    for (const feed of feeds) {
      console.log(`📡 Test feed: ${feed}`);
      
      try {
        const products = await apiService.getProductsFromMultipleFeeds(10, 1);
        console.log(`   ✅ ${products.length} produits récupérés`);
        
        if (products.length > 0) {
          console.log(`   Premier produit: ${products[0].product_title.slice(0, 50)}...`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
      }
      
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  }
}

testFeeds();
