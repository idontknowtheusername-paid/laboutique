/**
 * Test pour vérifier le gateway spécifique qui pose problème
 */

const LYGOS_API_KEY = 'lygosapp-199cfd2e-d4e7-4a25-b7dc-c45971eb6acd';
const LYGOS_API_URL = 'https://api.lygosapp.com/v1';

async function testSpecificGateway() {
  const gatewayId = '06dc83d6-18af-4f52-816a-52d3b396c11a';
  
  console.log('🔍 Test du gateway spécifique:', gatewayId);
  
  try {
    // Récupérer les détails du gateway
    const response = await fetch(`${LYGOS_API_URL}/gateway/${gatewayId}`, {
      method: 'GET',
      headers: { 'api-key': LYGOS_API_KEY }
    });

    if (response.ok) {
      const gateway = await response.json();
      console.log('✅ Détails du gateway:');
      console.log('   ID:', gateway.id);
      console.log('   Link:', gateway.link);
      console.log('   Amount:', gateway.amount);
      console.log('   Status:', gateway.status || 'N/A');
      console.log('   Creation Date:', gateway.creation_date);
      
      // Analyser l'URL
      console.log('\n🔗 Analyse de l\'URL:');
      if (gateway.link) {
        if (gateway.link.includes('lygosapp.com')) {
          console.log('   → URL Lygos directe');
        } else if (gateway.link.includes('jomionstore.com')) {
          console.log('   → URL vers notre site (widget intégré)');
        } else {
          console.log('   → Format inattendu:', gateway.link);
        }
      }
      
    } else {
      console.error('❌ Erreur:', response.status, await response.text());
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error.message);
  }
}

testSpecificGateway();