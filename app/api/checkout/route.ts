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
    const pendingOrder = await OrdersService.create({
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

    const orderDbId = (pendingOrder?.data as any)?.id;

    if (!orderDbId) {
      console.error('❌ Échec création commande');
      return NextResponse.json({ error: 'Impossible de créer la commande' }, { status: 500 });
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

    return NextResponse.json({ 
      success: true, 
      payment_url: gateway.payment_url,
      gateway_id: gateway.gateway_id,
      order_id: orderDbId,
      reference: orderId
    });

  } catch (error: any) {
    console.error('❌ Erreur checkout Lygos:', error);
    return NextResponse.json({ 
      error: error?.message || 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
