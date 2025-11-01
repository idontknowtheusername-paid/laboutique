import { NextRequest, NextResponse } from 'next/server';
import { LygosService } from '@/lib/services/lygos.service';

/**
 * API pour récupérer les détails d'une gateway Lygos
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gateway_id: string }> }
) {
  // ✅ Déclarer gatewayId avant le try pour qu'il soit accessible dans le catch
  let gatewayId: string;

  try {
    const resolvedParams = await params;
    gatewayId = resolvedParams.gateway_id;

    if (!gatewayId) {
      return NextResponse.json({ 
        error: 'gateway_id requis' 
      }, { status: 400 });
    }

    console.log('[Lygos Gateway API] 🔍 Récupération gateway:', gatewayId);

    // Récupérer les détails de la gateway depuis Lygos
    const gatewayDetails = await LygosService.getGatewayDetails(gatewayId);

    console.log('[Lygos Gateway API] 📋 Détails reçus:', gatewayDetails);

    return NextResponse.json({
      success: true,
      data: gatewayDetails,
      gateway_id: gatewayId
    });

  } catch (error: any) {
    console.error('[Lygos Gateway API] ❌ Erreur:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des détails',
      gateway_id: gatewayId || 'unknown'
    }, { status: 500 });
  }
}