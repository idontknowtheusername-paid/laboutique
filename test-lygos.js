/**
 * Test avec la nouvelle URL webhook
 */

const LYGOS_API_KEY = 'lygosapp-199cfd2e-d4e7-4a25-b7dc-c45971eb6acd';
const LYGOS_API_URL = 'https://api.lygosapp.com/v1';

async function testNewWebhookConfig() {
  console.log('🧪 Test avec nouvelle URL webhook: https://webhooks.jomionstore.com/lygos\n');
  
  try {
    // Créer une nouvelle gateway de test
    const createPayload = {
      amount: 1000,
      shop_name: 'JomionStore Test Webhook',
      order_id: `TEST-WEBHOOK-${Date.now()}`,
      message: 'Test nouvelle config webhook',
      success_url: 'https://jomionstore.com/checkout/success',
      failure_url: 'https://jomionstore.com/checkout/cancel'
    };

    console.log('🚀 Création gateway avec nouvelle config...');
    
    const response = await fetch(`${LYGOS_API_URL}/gateway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': LYGOS_API_KEY
      },
      body: JSON.stringify(createPayload)
    });

    if (response.ok) {
      const gateway = await response.json();
      
      console.log('✅ Gateway créée avec succès !');
      console.log('📋 Détails:');
      console.log(`   ID: ${gateway.id}`);
      console.log(`   Order ID: ${gateway.order_id}`);
      console.log(`   Amount: ${gateway.amount} ${gateway.currency}`);
      console.log('');
      
      // 🔍 ANALYSE CRITIQUE DU LINK
      console.log('🔍 ANALYSE DU LINK:');
      console.log(`   Link brut: ${gateway.link}`);
      
      if (gateway.link.includes('jomionstore.com')) {
        console.log('   ❌ Toujours vers notre site');
        console.log('   → Le problème persiste');
      } else if (gateway.link.includes('lygosapp.com') || gateway.link.includes('lygos')) {
        console.log('   ✅ SUCCÈS ! Vers la plateforme Lygos');
        console.log('   → Problème résolu !');
      } else {
        console.log('   ❓ Format inattendu');
        console.log('   → Nouveau comportement à analyser');
      }
      
      console.log('');
      console.log('🎯 PROCHAINE ÉTAPE:');
      if (gateway.link.includes('lygos')) {
        console.log('   → Modifier notre code pour rediriger directement');
        console.log('   → Supprimer la logique de widget');
      } else {
        console.log('   → Investiguer davantage ou contacter Lygos');
      }
      
    } else {
      const errorText = await response.text();
      console.error('❌ Erreur:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error.message);
  }
}

testNewWebhookConfig();
