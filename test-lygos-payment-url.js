/**
 * Test pour vérifier si l'URL de paiement Lygos existe
 */

async function testLygosPaymentUrl() {
  const gatewayId = '06dc83d6-18af-4f52-816a-52d3b396c11a';
  const testUrls = [
    `https://pay.lygosapp.com/${gatewayId}`,
    `https://checkout.lygosapp.com/${gatewayId}`,
    `https://payment.lygosapp.com/${gatewayId}`,
    `https://lygosapp.com/pay/${gatewayId}`,
    `https://lygosapp.com/checkout/${gatewayId}`
  ];

  console.log('🧪 Test des URLs de paiement Lygos...\n');

  for (const url of testUrls) {
    try {
      console.log(`🔍 Test: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log(`   Status: ${response.status}`);
      if (response.ok) {
        console.log('   ✅ URL accessible !');
      } else {
        console.log('   ❌ URL non accessible');
      }
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('   ⏱️ Timeout (10s)');
      } else {
        console.log(`   ❌ Erreur: ${error.message}`);
      }
    }
    console.log('');
  }
}

testLygosPaymentUrl();