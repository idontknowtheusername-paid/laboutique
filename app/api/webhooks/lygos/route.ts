import { NextRequest, NextResponse } from 'next/server';
import { LygosService } from '@/lib/services/lygos.service';
import { OrdersService } from '@/lib/services/orders.service';

/**
 * Webhook Lygos pour recevoir les notifications de paiement
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('[Lygos Webhook] Notification reçue:', body);

        // Extraire les données importantes du webhook
        const {
            order_id,
            gateway_id,
            transaction_id,
            status,
            amount,
            currency,
            message
        } = body;

        if (!order_id && !gateway_id) {
            console.error('[Lygos Webhook] Données manquantes:', body);
            return NextResponse.json({ error: 'order_id ou gateway_id manquant' }, { status: 400 });
        }

        // Vérifier le statut auprès de Lygos pour sécuriser
        let verifiedStatus;
        try {
            verifiedStatus = await LygosService.getPaymentStatus(order_id || gateway_id);
            console.log('[Lygos Webhook] Statut vérifié:', verifiedStatus);
        } catch (error) {
            console.error('[Lygos Webhook] Erreur vérification:', error);
            // Utiliser les données du webhook si la vérification échoue
            verifiedStatus = { status, order_id, gateway_id, transaction_id, amount, currency };
        }

        // Déterminer les statuts
        let orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' = 'pending';
        let paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' = 'pending';

        if (LygosService.isPaymentSuccessful(verifiedStatus.status)) {
            orderStatus = 'confirmed';
            paymentStatus = 'paid';
        } else if (LygosService.isPaymentFailed(verifiedStatus.status)) {
            orderStatus = 'cancelled';
            paymentStatus = 'failed';
        } else if (LygosService.isPaymentPending(verifiedStatus.status)) {
            orderStatus = 'pending';
            paymentStatus = 'pending';
        }

        // Trouver et mettre à jour la commande
        try {
            // Chercher la commande par order_id ou par référence dans les notes
            let foundOrder;

            if (order_id) {
                // Essayer de trouver par order_id direct
                foundOrder = await OrdersService.getById(order_id);

                if (!foundOrder?.data) {
                    // Chercher dans les notes si pas trouvé directement
                    foundOrder = await OrdersService.getByReferenceInNotes(order_id);
                }
            }

            if (gateway_id && !foundOrder?.data) {
                // Chercher par gateway_id dans les notes
                foundOrder = await OrdersService.getByReferenceInNotes(gateway_id);
            }

            const ord = foundOrder?.data as any;

            if (ord?.id) {
                await OrdersService.update({
                    id: ord.id,
                    status: orderStatus,
                    payment_status: paymentStatus,
                    notes: `Lygos webhook - Gateway: ${gateway_id} - Transaction: ${transaction_id} - Statut: ${verifiedStatus.status} - ${message || ''}`
                } as any);

                console.log('[Lygos Webhook] Commande mise à jour:', {
                    order_db_id: ord.id,
                    order_ref: order_id,
                    gateway_id,
                    status: orderStatus,
                    payment_status: paymentStatus
                });
            } else {
                console.warn('[Lygos Webhook] Commande non trouvée:', { order_id, gateway_id });
            }
        } catch (updateError) {
            console.error('[Lygos Webhook] Erreur mise à jour commande:', updateError);
        }

        // Répondre à Lygos que le webhook a été traité
        return NextResponse.json({
            success: true,
            message: 'Webhook traité avec succès',
            order_id: verifiedStatus.order_id,
            status: verifiedStatus.status
        });

    } catch (error: any) {
        console.error('❌ [Lygos Webhook] Erreur:', error);
        return NextResponse.json({
            error: 'Erreur lors du traitement du webhook',
            success: false
        }, { status: 500 });
    }
}

// Permettre les requêtes GET pour les tests
export async function GET() {
    return NextResponse.json({
        message: 'Webhook Lygos actif',
        timestamp: new Date().toISOString()
    });
}
