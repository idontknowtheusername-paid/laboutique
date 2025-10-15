import { NextRequest, NextResponse } from 'next/server';
import { QosicService } from '@/lib/services/qosic.service';
import { OrdersService } from '@/lib/services/orders.service';

export async function POST(request: NextRequest) {
  try {
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

    // Vérifier que Qosic est configuré
    if (!process.env.QOSIC_QOSKEY) {
      console.error('❌ QOSIC_QOSKEY non configuré');
      return NextResponse.json({ error: 'Passerelle de paiement non configurée' }, { status: 500 });
    }

    // Calculer les montants
    const subtotal = items.reduce((s: number, it: any) => s + (it.price * it.quantity), 0);
    const shipping = subtotal > 50000 ? 0 : 2000;
    const total = subtotal + shipping;

    // URLs de callback
    const origin = new URL(request.url).origin;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || origin;
    const returnUrl = `${appUrl}/checkout/callback`;

    // Générer une référence unique pour la transaction
    const transref = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    console.log('[Checkout] Création commande:', { user_id, total, transref });

    // Créer la commande en attente AVANT le paiement
    const pendingOrder = await OrdersService.create({
      user_id,
      items,
      shipping_address: customer?.shipping_address || {
        address: customer?.address,
        city: customer?.city,
        country: customer?.country || 'Benin',
        postalCode: customer?.postalCode || '229'
      },
      billing_address: customer?.billing_address || customer?.shipping_address || {},
      payment_method: 'qosic',
      notes: `En attente - Qosic ref: ${transref}`,
    } as any);

    const orderId = (pendingOrder?.data as any)?.id;

    if (!orderId) {
      console.error('❌ Échec création commande');
      return NextResponse.json({ error: 'Impossible de créer la commande' }, { status: 500 });
    }

    console.log('[Checkout] Commande créée:', orderId);

    // Initialiser la transaction Qosic
    let checkout;
    try {
      checkout = await QosicService.initCheckout({
        amount: total,
        customer: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          address: customer.address || 'Cotonou',
          city: customer.city || 'Cotonou',
          country: customer.country || 'Benin',
          postalCode: customer.postalCode || '229'
        },
        transref: transref,
        returnUrl: `${returnUrl}?order_id=${orderId}`,
        type: 'all' // Mobile Money + Carte bancaire
      });

      console.log('[Checkout] Qosic initialisé:', checkout.url);
    } catch (e: any) {
      console.error('❌ Erreur Qosic:', e);
      
      // Annuler la commande si le paiement échoue
      await OrdersService.update({ 
        id: orderId, 
        status: 'cancelled',
        notes: `Échec initialisation paiement: ${e.message}` 
      } as any);

      return NextResponse.json({ 
        error: e?.message || 'Échec de l\'initialisation du paiement' 
      }, { status: 500 });
    }

    // Mettre à jour la commande avec la référence Qosic
    await OrdersService.update({ 
      id: orderId, 
      notes: `Qosic ref: ${transref}` 
    } as any);

    return NextResponse.json({ 
      success: true, 
      payment_url: checkout.url, 
      reference: transref,
      order_id: orderId
    });

  } catch (error: any) {
    console.error('❌ Erreur checkout:', error);
    return NextResponse.json({ 
      error: error?.message || 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

