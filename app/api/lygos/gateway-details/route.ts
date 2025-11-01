import { NextRequest, NextResponse } from 'next/server';
import { LygosService } from '@/lib/services/lygos.service';

/**
 * API pour récupérer les détails d'une gateway et son URL de paiement
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gateway_id } = body;

    if (!gateway_id) {
      return NextResponse.json({ 
        error: 'gateway_id requis' 
      }, { status: 400 });
    }

    console.log('[Lygos Gateway Details] 🔍 Récupération pour:', gateway_id);

    try {
      // Essayer de récupérer les détails depuis Lygos
      const details = await LygosService.getGatewayDetails(gateway_id);
      
      if (details && details.link) {
        const paymentUrl = details.link.startsWith('http') 
          ? details.link 
          : `https://${details.link}`;
          
        console.log('[Lygos Gateway Details] ✅ URL trouvée:', paymentUrl);
        
        return NextResponse.json({
          success: true,
          payment_url: paymentUrl,
          gateway_id: gateway_id,
          details: details
        });
      }
    } catch (lygosError) {
      console.warn('[Lygos Gateway Details] ⚠️ Erreur Lygos API:', lygosError);
    }

    // Fallback : construire l'URL selon les patterns connus
    const fallbackUrls = [
      `https://checkout.lygosapp.com/${gateway_id}`,
      `https://pay.lygosapp.com/${gateway_id}`,
      `https://lygosapp.com/pay/${gateway_id}`
    ];

    console.log('[Lygos Gateway Details] 🔄 Utilisation fallback URL');

    return NextResponse.json({
      success: true,
      payment_url: fallbackUrls[0], // Utiliser le premier par défaut
      gateway_id: gateway_id,
      fallback_urls: fallbackUrls,
      note: 'URL construite par fallback - API Lygos indisponible'
    });

  } catch (error: any) {
    console.error('[Lygos Gateway Details] ❌ Erreur:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des détails'
    }, { status: 500 });
  }
}