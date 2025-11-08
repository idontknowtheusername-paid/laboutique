// test-account-status.js
require('dotenv').config({ path: '.env.local' });

async function testAccountStatus() {
  console.log('🔍 Vérification du statut du compte AliExpress Dropship\n');
  
  try {
    // Test 1: Vérifier l'authentification
    console.log('1️⃣ Test authentification OAuth...');
    const authResponse = await fetch('http://localhost:3000/api/aliexpress/test-auth');
    const authData = await authResponse.json();
    console.log('   Résultat:', authData.success ? '✅ OK' : '❌ ÉCHEC');
    
    // Test 2: Tester chaque feed individuellement
    console.log('\n2️⃣ Test des feeds disponibles...');
    const feeds = ['ds-bestselling', 'ds-new-arrival', 'ds-promotion', 'ds-choice', 'ds-plus'];
    
    for (const feed of feeds) {
      const response = await fetch('http://localhost:3000/api/aliexpress/test-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feed_name: feed })
      });
      const data = await response.json();
      console.log(`   Feed "${feed}": ${data.count || 0} produits`);
    }
    
    console.log('\n💡 Diagnostic:');
    console.log('   Si tous les feeds retournent 0 produits, cela signifie que:');
    console.log('   - Le compte Dropship est activé ✅');
    console.log('   - Mais aucun produit n\'est disponible dans les feeds ❌');
    console.log('\n   Solution: Contacter le support AliExpress pour activer les feeds');
    console.log('   ou utiliser l\'import individuel par URL qui fonctionne déjà.');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testAccountStatus();
