import { NextRequest, NextResponse } from 'next/server';
import { QosicService } from '@/lib/services/qosic.service';
import { OrdersService } from '@/lib/services/orders.service';

/**
 * API pour vérifier le statut d'une transaction Qosic
 * Cette route est appelée côté serveur pour sécuriser la vérification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transref, order_id } = body;

    if (!transref) {
      return NextResponse.json({ 
        error: 'Référence de transaction manquante' 
      }, { status: 400 });
    }

    console.log('[Qosic Verify] Vérification transaction:', { transref, order_id });

    // Vérifier le statut auprès de Qosic
    const status = await QosicService.getTransactionStatus(transref);

    console.log('[Qosic Verify] Statut reçu:', status);

    // Déterminer le statut de la commande et du paiement
    let orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' = 'pending';
    let paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' = 'pending';

    if (QosicService.isPaymentSuccessful(status.status)) {
      orderStatus = 'confirmed';
      paymentStatus = 'paid';
    } else if (QosicService.isPaymentFailed(status.status)) {
      orderStatus = 'cancelled';
      paymentStatus = 'failed';
    } else if (QosicService.isPaymentPending(status.status)) {
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
          notes: `Qosic ref: ${transref} - Statut: ${status.status} - ${status.message || ''}`
        } as any);

        console.log('[Qosic Verify] Commande mise à jour:', { order_id, orderStatus, paymentStatus });
      } catch (updateError) {
        console.error('[Qosic Verify] Erreur mise à jour commande:', updateError);
        // Ne pas bloquer si la mise à jour échoue
      }
    } else {
      // Si pas d'order_id, essayer de trouver la commande par la référence
      try {
        const foundOrder = await OrdersService.getByReferenceInNotes(transref);
        const ord = foundOrder?.data as any;
        
        if (ord?.id) {
          await OrdersService.update({
            id: ord.id,
            status: orderStatus,
            payment_status: paymentStatus,
            notes: `Qosic ref: ${transref} - Statut: ${status.status} - ${status.message || ''}`
          } as any);

          console.log('[Qosic Verify] Commande trouvée et mise à jour:', ord.id);
        }
      } catch (findError) {
        console.error('[Qosic Verify] Erreur recherche commande:', findError);
      }
    }

    return NextResponse.json({
      success: true,
      transref: status.transref,
      status: status.status,
      is_successful: QosicService.isPaymentSuccessful(status.status),
      is_failed: QosicService.isPaymentFailed(status.status),
      is_pending: QosicService.isPaymentPending(status.status),
      order_status: orderStatus,
      payment_status: paymentStatus,
      message: status.message,
      amount: status.amount,
      data: status
    });

  } catch (error: any) {
    console.error('❌ [Qosic Verify] Erreur:', error);
    return NextResponse.json({ 
      error: error?.message || 'Erreur lors de la vérification du paiement',
      success: false 
    }, { status: 500 });
  }
}
