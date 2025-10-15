import { NextRequest, NextResponse } from 'next/server';
import { QosicMobileMoneyService } from '@/lib/services/qosic-mobile-money.service';
import { OrdersService } from '@/lib/services/orders.service';

/**
 * API pour vérifier le statut d'une transaction Mobile Money
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

    console.log('[Qosic MM Verify] Vérification transaction:', { transref, order_id });

    // Vérifier le statut auprès de Qosic
    const status = await QosicMobileMoneyService.getTransactionStatus(transref);

    console.log('[Qosic MM Verify] Statut reçu:', status);

    const responseCode = status.response_code || status.status;

    // Déterminer le statut de la commande et du paiement
    let orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' = 'pending';
    let paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' = 'pending';
    let userMessage = '';

    if (QosicMobileMoneyService.isPaymentSuccessful(responseCode)) {
      orderStatus = 'confirmed';
      paymentStatus = 'paid';
      userMessage = 'Paiement réussi ! Votre commande a été confirmée.';
    } else if (QosicMobileMoneyService.isPaymentFailed(responseCode)) {
      orderStatus = 'cancelled';
      paymentStatus = 'failed';
      userMessage = QosicMobileMoneyService.getErrorMessage(responseCode);
    } else if (QosicMobileMoneyService.isPaymentPending(responseCode)) {
      orderStatus = 'pending';
      paymentStatus = 'pending';
      userMessage = 'Paiement en cours. Vérifiez votre téléphone pour valider.';
    } else {
      // Statut inconnu
      orderStatus = 'pending';
      paymentStatus = 'pending';
      userMessage = 'Vérification du statut en cours...';
    }

    // Mettre à jour la commande si un order_id est fourni
    if (order_id) {
      try {
        await OrdersService.update({
          id: order_id,
          status: orderStatus,
          payment_status: paymentStatus,
          notes: `Mobile Money ref: ${transref} - Code: ${responseCode} - ${status.message || userMessage}`
        } as any);

        console.log('[Qosic MM Verify] Commande mise à jour:', { order_id, orderStatus, paymentStatus });
      } catch (updateError) {
        console.error('[Qosic MM Verify] Erreur mise à jour commande:', updateError);
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
            notes: `Mobile Money ref: ${transref} - Code: ${responseCode} - ${status.message || userMessage}`
          } as any);

          console.log('[Qosic MM Verify] Commande trouvée et mise à jour:', ord.id);
        }
      } catch (findError) {
        console.error('[Qosic MM Verify] Erreur recherche commande:', findError);
      }
    }

    return NextResponse.json({
      success: true,
      transref: status.transref,
      status: responseCode,
      is_successful: QosicMobileMoneyService.isPaymentSuccessful(responseCode),
      is_failed: QosicMobileMoneyService.isPaymentFailed(responseCode),
      is_pending: QosicMobileMoneyService.isPaymentPending(responseCode),
      order_status: orderStatus,
      payment_status: paymentStatus,
      message: userMessage,
      response_code: responseCode,
      data: status
    });

  } catch (error: any) {
    console.error('❌ [Qosic MM Verify] Erreur:', error);
    return NextResponse.json({ 
      error: error?.message || 'Erreur lors de la vérification du paiement',
      success: false 
    }, { status: 500 });
  }
}
