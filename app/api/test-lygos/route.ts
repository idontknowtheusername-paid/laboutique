import { NextRequest, NextResponse } from 'next/server';
import { LygosService } from '@/lib/services/lygos.service';

export async function GET(request: NextRequest) {
  try {
    console.log('[Test Lygos] 🧪 Début du test de configuration...');

    // Test de la configuration
    const configTest = await LygosService.testConfiguration();
    
    console.log('[Test Lygos] 📋 Résultat test config:', configTest);

    // Test de création d'une passerelle factice
    let gatewayTest = null;
    try {
      gatewayTest = await LygosService.createGateway({
        amount: 1000, // 1000 FCFA
        currency: 'XOF',
        customer: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '+22967000000',
          address: 'Test Address',
          city: 'Cotonou',
          country: 'BJ'
        },
        orderId: `TEST-${Date.now()}`,
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/test-return`,
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/lygos`,
        description: 'Test de configuration Lygos'
      });
      
      console.log('[Test Lygos] ✅ Passerelle test créée:', gatewayTest);
    } catch (gatewayError: any) {
      console.error('[Test Lygos] ❌ Erreur création passerelle test:', gatewayError);
      gatewayTest = { error: gatewayError.message };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        LYGOS_API_KEY: !!process.env.LYGOS_API_KEY,
        LYGOS_MODE: process.env.LYGOS_MODE || 'sandbox',
        LYGOS_API_URL: process.env.LYGOS_API_URL || 'default',
        APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'not set'
      },
      tests: {
        configuration: configTest,
        gateway_creation: gatewayTest
      }
    });

  } catch (error: any) {
    console.error('[Test Lygos] 💥 Erreur générale:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}