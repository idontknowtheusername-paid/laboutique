import { NextRequest, NextResponse } from 'next/server';
import { LygosService } from '@/lib/services/lygos.service';
import { OrdersService } from '@/lib/services/orders.service';
import { paymentLogger } from '@/lib/utils/logger';

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

    paymentLogger.info('Vérification transaction:', { order_id, gateway_id });

    // Vérifier le statut auprès de Lygos
      let status;
      try {
          status = await LygosService.getPaymentStatus(order_id || gateway_id);
        paymentLogger.info('Statut reçu:', status);
    } catch (statusError) {
        paymentLogger.error('Erreur récupération statut:', statusError);
        // Retourner un statut par défaut si Lygos ne répond pas
        status = {
            order_id: order_id || gateway_id,
            status: 'pending',
            amount: 0,
            currency: 'XOF',
            gateway_id: gateway_id,
            message: 'Vérification en cours...'
        };
    }

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

        paymentLogger.info('Commande mise à jour:', { order_id, orderStatus, paymentStatus });
      } catch (updateError) {
        paymentLogger.error('Erreur mise à jour commande:', updateError);
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
    paymentLogger.error('Erreur:', error);
    return NextResponse.json({ 
      error: error?.message || 'Erreur lors de la vérification du paiement',
      success: false 
    }, { status: 500 });
  }
}
