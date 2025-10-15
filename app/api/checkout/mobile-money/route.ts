import { NextRequest, NextResponse } from 'next/server';
import { QosicMobileMoneyService } from '@/lib/services/qosic-mobile-money.service';
import { OrdersService } from '@/lib/services/orders.service';
import { validateCartItems, calculateOrderTotal } from '@/lib/helpers/validate-cart';
import { checkRateLimit } from '@/lib/helpers/rate-limiter';

/**
 * API pour initier un paiement Mobile Money direct
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ RATE LIMITING : Limiter à 5 tentatives par minute
    const { allowed, resetTime } = checkRateLimit(request);
    
    if (!allowed) {
      return NextResponse.json({ 
        error: `Trop de tentatives. Réessayez dans ${resetTime} secondes.` 
      }, { status: 429 });
    }

    const body = await request.json();
    const { user_id, items, customer, phone } = body || {};

    // Validation des données
    if (!user_id || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ 
        error: 'user_id et items sont requis' 
      }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ 
        error: 'Numéro de téléphone requis pour le paiement Mobile Money' 
      }, { status: 400 });
    }

    if (!customer?.firstName || !customer?.lastName || !customer?.email) {
      return NextResponse.json({ 
        error: 'Informations client incomplètes (prénom, nom, email requis)' 
      }, { status: 400 });
    }

    // Vérifier que Mobile Money est configuré
    if (!process.env.QOSIC_MM_USERNAME || !process.env.QOSIC_MM_PASSWORD || !process.env.QOSIC_MM_CLIENT_ID) {
      console.error('❌ Credentials Qosic Mobile Money non configurés');
      return NextResponse.json({ 
        error: 'Paiement Mobile Money non configuré' 
      }, { status: 500 });
    }

    // ✅ VALIDATION CRITIQUE : Vérifier les prix depuis la DB
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

    console.log('[Checkout MM] Montants validés:', { subtotal, shipping, total });

    // Générer une référence unique
    const transref = `MM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    console.log('[Checkout MM] Création commande:', { user_id, total, transref, phone });

    // Créer la commande en attente (avec items validés)
    const pendingOrder = await OrdersService.create({
      user_id,
      items: validatedItems, // ✅ Items avec prix validés depuis la DB
      shipping_address: customer?.shipping_address || {
        address: customer?.address,
        city: customer?.city,
        country: customer?.country || 'Benin',
        postalCode: customer?.postalCode || '229'
      },
      billing_address: customer?.billing_address || customer?.shipping_address || {},
      payment_method: 'mobile_money',
      notes: `En attente - Mobile Money ref: ${transref} - Tél: ${phone}`,
    } as any);

    const orderId = (pendingOrder?.data as any)?.id;

    if (!orderId) {
      console.error('❌ Échec création commande');
      return NextResponse.json({ 
        error: 'Impossible de créer la commande' 
      }, { status: 500 });
    }

    console.log('[Checkout MM] Commande créée:', orderId);

    // Initier le paiement Mobile Money
    let payment;
    try {
      payment = await QosicMobileMoneyService.requestPayment({
        msisdn: phone,
        amount: total,
        firstname: customer.firstName,
        lastname: customer.lastName,
        transref: transref
      });

      console.log('[Checkout MM] Paiement initié:', payment);
    } catch (e: any) {
      console.error('❌ Erreur Mobile Money:', e);
      
      // Annuler la commande si le paiement échoue
      await OrdersService.update({ 
        id: orderId, 
        status: 'cancelled',
        payment_status: 'failed',
        notes: `Échec initialisation Mobile Money: ${e.message}` 
      } as any);

      return NextResponse.json({ 
        error: e?.message || 'Échec de l\'initialisation du paiement Mobile Money' 
      }, { status: 500 });
    }

    // Mettre à jour la commande avec la référence
    await OrdersService.update({ 
      id: orderId, 
      notes: `Mobile Money ref: ${transref} - Tél: ${phone} - Statut: ${payment.status}` 
    } as any);

    return NextResponse.json({ 
      success: true, 
      transref: transref,
      order_id: orderId,
      status: payment.status,
      message: payment.message || 'Vérifiez votre téléphone pour valider le paiement',
      requires_validation: true // Indique qu'il faut vérifier le statut
    });

  } catch (error: any) {
    console.error('❌ Erreur checkout Mobile Money:', error);
    return NextResponse.json({ 
      error: error?.message || 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
