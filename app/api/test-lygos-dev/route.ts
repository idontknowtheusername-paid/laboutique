import { NextRequest, NextResponse } from 'next/server';
import { LygosService } from '@/lib/services/lygos.service';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [TEST LYGOS DEV] Tests en mode développement...');

    // Forcer le mode développement en supprimant temporairement l'API Key
    const originalApiKey = process.env.LYGOS_API_KEY;
    delete process.env.LYGOS_API_KEY;

    // Test: Création d'un gateway en mode dev
    console.log('📋 Test: Création gateway (mode dev)');
    const testGateway = await LygosService.createGateway({
      amount: 1500,
      currency: 'XOF',
      customer: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@jomionstore.com',
        phone: '+22912345678'
      },
      orderId: `test-dev-${Date.now()}`,
      returnUrl: 'https://jomionstore.com/success',
      description: 'Test de paiement JomionStore (mode dev)'
    });
    console.log('✅ Gateway créé (dev):', testGateway);

    // Restaurer l'API Key
    if (originalApiKey) {
      process.env.LYGOS_API_KEY = originalApiKey;
    }

    // Test: Vérification que l'URL générée est correcte
    const isValidUrl = testGateway.payment_url.startsWith('https://pay.lygosapp.com/');
    console.log('🔗 URL valide:', isValidUrl, testGateway.payment_url);

    // Test: Vérification du statut (mode dev)
    const status = await LygosService.getPaymentStatus(testGateway.order_id || 'test-order');
    console.log('✅ Statut (dev):', status);

    return NextResponse.json({
      success: true,
      message: 'Tests Lygos (mode dev) terminés avec succès',
      results: {
        gateway: testGateway,
        url_valid: isValidUrl,
        payment_status: status,
        mode: 'development'
      }
    });

  } catch (error: any) {
    console.error('❌ [TEST LYGOS DEV] Erreur:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erreur lors des tests Lygos (mode dev)',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}