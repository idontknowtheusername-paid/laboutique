import { NextRequest, NextResponse } from 'next/server';
import { LygosService } from '@/lib/services/lygos.service';
import { OrdersService } from '@/lib/services/orders.service';
import { validateCartItems, calculateOrderTotal } from '@/lib/helpers/validate-cart';
import { checkRateLimit } from '@/lib/helpers/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { allowed, resetTime } = checkRateLimit(request);
    
    if (!allowed) {
      return NextResponse.json({ 
        error: `Trop de tentatives. Réessayez dans ${resetTime} secondes.` 
      }, { status: 429 });
    }

    const body = await request.json();
    const { user_id, items, customer } = body || {};

    // Validation des données
    if (!user_id || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'user_id et items sont requis' }, { status: 400 });
    }

    // Vérifier que l'user_id est un UUID valide
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user_id)) {
      return NextResponse.json({ error: 'user_id invalide (doit être un UUID)' }, { status: 400 });
    }

    if (!customer?.firstName || !customer?.lastName || !customer?.email || !customer?.phone) {
      return NextResponse.json({ 
        error: 'Informations client incomplètes (prénom, nom, email, téléphone requis)' 
      }, { status: 400 });
    }

    // Vérifier que Lygos est configuré
    if (!process.env.LYGOS_API_KEY) {
      console.error('❌ LYGOS_API_KEY non configuré');
      return NextResponse.json({ error: 'Passerelle de paiement non configurée' }, { status: 500 });
    }

    // Validation critique : Vérifier les prix depuis la DB
    const validation = await validateCartItems(items);
    
    if (!validation.success || !validation.items) {
      console.error('❌ Validation panier échouée:', validation.error);
      return NextResponse.json({ 
        error: validation.error || 'Panier invalide' 
      }, { status: 400 });
    }

    const validatedItems = validation.items;

    // Calculer les montants avec les VRAIS prix
    const { subtotal, shipping, total } = calculateOrderTotal(validatedItems);

    console.log('[Checkout Lygos] Montants validés:', { subtotal, shipping, total });

    // URLs de callback
    const origin = new URL(request.url).origin;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || origin;
    const returnUrl = `${appUrl}/checkout/callback`;

    // Générer une référence unique pour la transaction
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    console.log('[Checkout Lygos] Création commande:', { user_id, total, orderId });

    // Créer la commande en attente AVANT le paiement
    console.log('[Checkout] 📝 Création commande avec données:', {
      user_id,
      items_count: validatedItems.length,
      customer_email: customer?.email
    });

    let pendingOrder;
    try {
      pendingOrder = await OrdersService.create({
        user_id,
        items: validatedItems,
        shipping_address: customer?.shipping_address || {
          address: customer?.address,
          city: customer?.city,
          country: customer?.country || 'Benin',
          postalCode: customer?.postalCode || '229'
        },
        billing_address: customer?.billing_address || customer?.shipping_address || {},
        payment_method: 'lygos',
        notes: `En attente - Lygos ref: ${orderId}`,
      } as any);

      console.log('[Checkout] 📋 Résultat création commande:', {
        success: pendingOrder?.success,
        error: pendingOrder?.error,
        data_id: (pendingOrder?.data as any)?.id
      });
    } catch (createError: any) {
      console.error('[Checkout] 💥 Erreur création commande:', createError);
      return NextResponse.json({
        error: `Erreur création commande: ${createError.message}`,
        debug: {
          error_message: createError.message,
          error_code: createError.code,
          error_details: createError.details,
          error_hint: createError.hint,
          stack: createError.stack?.split('\n').slice(0, 5) // Limiter la stack trace
        }
      }, { status: 500 });
    }

    const orderDbId = (pendingOrder?.data as any)?.id;

    if (!orderDbId) {
      console.error('[Checkout] ❌ Échec création commande - Pas d\'ID retourné');
      console.error('[Checkout] 📋 Réponse complète:', pendingOrder);
      return NextResponse.json({
        error: `Impossible de créer la commande: ${pendingOrder?.error || 'Raison inconnue'}`,
        debug: {
          pending_order_response: pendingOrder,
          order_db_id: orderDbId,
          validation_success: !!validatedItems,
          items_count: validatedItems?.length
        }
      }, { status: 500 });
    }

    console.log('[Checkout Lygos] Commande créée:', orderDbId);

    // Initialiser la transaction Lygos
    let gateway;
    try {
      gateway = await LygosService.createGateway({
        amount: total,
        currency: 'XOF',
        customer: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          address: customer.address || 'Cotonou',
          city: customer.city || 'Cotonou',
          country: customer.country || 'BJ'
        },
        orderId: orderId,
        returnUrl: `${returnUrl}?order_id=${orderDbId}`,
        webhookUrl: `${appUrl}/api/webhooks/lygos`,
        description: `Commande JomionStore ${orderId}`
      });

      console.log('[Checkout Lygos] Passerelle créée:', gateway.gateway_id);
    } catch (e: any) {
      console.error('❌ Erreur Lygos:', e);
      
      // Annuler la commande si le paiement échoue
      await OrdersService.update({ 
        id: orderDbId, 
        status: 'cancelled',
        notes: `Échec initialisation paiement: ${e.message}` 
      } as any);

      return NextResponse.json({ 
        error: e?.message || 'Échec de l\'initialisation du paiement' 
      }, { status: 500 });
    }

    // Mettre à jour la commande avec la référence Lygos
    await OrdersService.update({ 
      id: orderDbId,
      notes: `Lygos gateway: ${gateway.gateway_id} - Order: ${orderId}` 
    } as any);

    // ✅ CORRECTION : Retourner seulement les données nécessaires
    return NextResponse.json({ 
      success: true, 
      gateway_id: gateway.gateway_id,
      order_id: orderDbId,
      reference: orderId,
      // Informations additionnelles pour debug
      debug: {
        lygos_payment_url: gateway.payment_url,
        total_amount: total,
        currency: 'XOF'
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur checkout Lygos:', error);
    return NextResponse.json({ 
      error: error?.message || 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
