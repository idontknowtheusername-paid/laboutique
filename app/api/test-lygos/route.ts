import { NextRequest, NextResponse } from 'next/server';
import { LygosService } from '@/lib/services/lygos.service';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [TEST LYGOS] Début des tests...');

    // Test 1: Configuration (skip si pas d'API Key)
    console.log('📋 Test 1: Configuration Lygos');
    let configTest;
    try {
      configTest = await LygosService.testConfiguration();
    } catch (error: any) {
      configTest = { success: false, message: 'API Key manquante (mode dev)' };
    }
    console.log('✅ Résultat config:', configTest);

    // Test 2: Création d'un gateway de test (mode dev si pas d'API Key)
    console.log('📋 Test 2: Création gateway');
    const testGateway = await LygosService.createGateway({
      amount: 1000,
      currency: 'XOF',
      customer: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@jomionstore.com',
        phone: '+22912345678'
      },
      orderId: `test-${Date.now()}`,
      returnUrl: 'https://jomionstore.com/success',
      description: 'Test de paiement JomionStore'
    });
    console.log('✅ Gateway créé:', testGateway);

    // Test 3: Liste des gateways
    console.log('📋 Test 3: Liste gateways');
    const gateways = await LygosService.listGateways();
    console.log('✅ Gateways trouvés:', gateways.length);

    // Test 4: Vérification statut
    console.log('📋 Test 4: Statut paiement');
    const status = await LygosService.getPaymentStatus(testGateway.order_id || 'test-order');
    console.log('✅ Statut:', status);

    return NextResponse.json({
      success: true,
      message: 'Tests Lygos terminés avec succès',
      results: {
        configuration: configTest,
        gateway: testGateway,
        gateways_count: gateways.length,
        payment_status: status
      }
    });

  } catch (error: any) {
    console.error('❌ [TEST LYGOS] Erreur:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erreur lors des tests Lygos',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}