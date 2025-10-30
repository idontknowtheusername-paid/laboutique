import { NextRequest, NextResponse } from 'next/server';
import { LygosService } from '@/lib/services/lygos.service';
import { OrdersService } from '@/lib/services/orders.service';

/**
 * API pour vérifier le statut d'une transaction Lygos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, gateway_id } = body;

    if (!order_id && !gateway_id) {
      return NextResponse.json({ 
        error: 'order_id ou gateway_id requis' 
      }, { status: 400 });
    }

    console.log('[Lygos Verify] Vérification transaction:', { order_id, gateway_id });

    // Vérifier le statut auprès de Lygos
    const status = await LygosService.getPaymentStatus(order_id || gateway_id);

    console.log('[Lygos Verify] Statut reçu:', status);

    // Déterminer le statut de la commande et du paiement
    let orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' = 'pending';
    let paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' = 'pending';

    if (LygosService.isPaymentSuccessful(status.status)) {
      orderStatus = 'confirmed';
      paymentStatus = 'paid';
    } else if (LygosService.isPaymentFailed(status.status)) {
      orderStatus = 'cancelled';
      paymentStatus = 'failed';
    } else if (LygosService.isPaymentPending(status.status)) {
      orderStatus = 'pending';
      paymentStatus = 'pending';
    }

    // Mettre à jour la commande si un order_id est fourni
    if (order_id) {
      try {
        await OrdersService.update({
          id: order_id,
          status: orderStatus,
          payment_status: paymentStatus,
          notes: `Lygos gateway: ${status.gateway_id} - Statut: ${status.status} - ${status.message || ''}`
        } as any);

        console.log('[Lygos Verify] Commande mise à jour:', { order_id, orderStatus, paymentStatus });
      } catch (updateError) {
        console.error('[Lygos Verify] Erreur mise à jour commande:', updateError);
      }
    }

    return NextResponse.json({
      success: true,
      order_id: status.order_id,
      status: status.status,
      is_successful: LygosService.isPaymentSuccessful(status.status),
      is_failed: LygosService.isPaymentFailed(status.status),
      is_pending: LygosService.isPaymentPending(status.status),
      order_status: orderStatus,
      payment_status: paymentStatus,
      message: status.message,
      amount: status.amount,
      gateway_id: status.gateway_id,
      transaction_id: status.transaction_id,
      data: status
    });

  } catch (error: any) {
    console.error('❌ [Lygos Verify] Erreur:', error);
    return NextResponse.json({ 
      error: error?.message || 'Erreur lors de la vérification du paiement',
      success: false 
    }, { status: 500 });
  }
}
