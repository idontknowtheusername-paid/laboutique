/**
 * Test simple du flux Lygos
 * À exécuter avec: node test-lygos-flow.js
 */

const LYGOS_API_KEY = 'lygosapp-199cfd2e-d4e7-4a25-b7dc-c45971eb6acd';
const LYGOS_API_URL = 'https://api.lygosapp.com/v1';

async function testLygosFlow() {
  console.log('🧪 Test du flux Lygos...\n');

  try {
    // 1. Créer une gateway de test
    console.log('1️⃣ Création d\'une gateway de test...');
    
    const createResponse = await fetch(`${LYGOS_API_URL}/gateway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': LYGOS_API_KEY,
      },
      body: JSON.stringify({
        amount: 1000, // 1000 XOF
        shop_name: 'JomionStore Test',
        order_id: `TEST-${Date.now()}`,
        message: 'Test de paiement',
        success_url: 'https://jomionstore.com/success',
        failure_url: 'https://jomionstore.com/failure'
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Erreur ${createResponse.status}: ${errorText}`);
    }

    const gateway = await createResponse.json();
    
    console.log('✅ Gateway créée avec succès !');
    console.log('📋 Détails:');
    console.log(`   - ID: ${gateway.id}`);
    console.log(`   - Montant: ${gateway.amount} ${gateway.currency}`);
    console.log(`   - URL de paiement: ${gateway.link}`);
    console.log('');

    // 2. Analyser l'URL retournée
    console.log('2️⃣ Analyse de l\'URL de paiement...');
    
    const paymentUrl = gateway.link;
    console.log(`🔗 URL brute: ${paymentUrl}`);
    
    // Vérifier le format de l'URL
    if (paymentUrl.startsWith('http')) {
      console.log('✅ URL complète fournie par Lygos');
    } else {
      console.log('⚠️ URL relative, ajout de https://');
      console.log(`🔗 URL finale: https://${paymentUrl}`);
    }
    
    // Vérifier si c'est une URL Lygos ou notre site
    if (paymentUrl.includes('lygosapp.com') || paymentUrl.includes('lygos')) {
      console.log('✅ URL pointe vers Lygos (redirection externe)');
    } else if (paymentUrl.includes('jomionstore.com')) {
      console.log('⚠️ URL pointe vers notre site (widget intégré)');
    } else {
      console.log('❓ Format d\'URL inattendu');
    }
    
    console.log('');

    // 3. Test de vérification du statut
    console.log('3️⃣ Test de vérification du statut...');
    
    const statusResponse = await fetch(`${LYGOS_API_URL}/gateway/payin/${gateway.order_id}`, {
      method: 'GET',
      headers: {
        'api-key': LYGOS_API_KEY,
      },
    });

    if (statusResponse.ok) {
      const status = await statusResponse.json();
      console.log('✅ Vérification du statut réussie');
      console.log(`📊 Statut: ${status.status} pour order_id: ${status.order_id}`);
    } else {
      console.log('⚠️ Vérification du statut échouée (normal pour un nouveau paiement)');
      console.log(`   Status: ${statusResponse.status}`);
    }

    console.log('');
    console.log('🎉 Test terminé avec succès !');
    console.log('');
    console.log('📝 Résumé:');
    console.log(`   - Gateway ID: ${gateway.id}`);
    console.log(`   - URL de paiement: ${gateway.link}`);
    console.log(`   - Le client doit être redirigé vers cette URL`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testLygosFlow();