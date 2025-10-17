import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('tracking');
    const orderNumber = searchParams.get('order');
    const email = searchParams.get('email');

    if (!trackingNumber && !(orderNumber && email)) {
      return NextResponse.json(
        { success: false, error: 'Code de suivi ou numéro de commande + email requis' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        tracking_number,
        status,
        total_amount,
        created_at,
        updated_at,
        shipping_address,
        estimated_delivery,
        delivery_date,
        tracking_events,
        user:users(email, first_name, last_name)
      `);

    if (trackingNumber) {
      query = query.eq('tracking_number', trackingNumber);
    } else {
      query = query.eq('order_number', orderNumber).eq('users.email', email);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Déterminer l'étape actuelle basée sur le statut
    const statusSteps = {
      'pending': 1,
      'confirmed': 1,
      'processing': 2,
      'shipped': 3,
      'in_transit': 4,
      'delivered': 5,
      'cancelled': 0
    };

    const currentStep = statusSteps[order.status as keyof typeof statusSteps] || 1;

    // Générer les événements de suivi si pas déjà présents
    let trackingEvents = order.tracking_events || [];
    
    if (!trackingEvents || trackingEvents.length === 0) {
      trackingEvents = generateTrackingEvents(order.status, order.created_at, order.estimated_delivery);
    }

    // Formater l'adresse de livraison
    const address = order.shipping_address ? 
      `${order.shipping_address.city}, ${order.shipping_address.region || ''}`.trim() : 
      'Adresse non disponible';

    const result = {
      orderId: order.id,
      orderNumber: order.order_number,
      trackingNumber: order.tracking_number,
      status: order.status,
      currentStep,
      orderDate: new Date(order.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      estimatedDelivery: order.estimated_delivery ? 
        new Date(order.estimated_delivery).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) : 
        'À déterminer',
      deliveryDate: order.delivery_date ? 
        new Date(order.delivery_date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) : 
        null,
      address,
      totalAmount: order.total_amount,
      trackingEvents,
      customerName: order.user ? `${order.user.first_name} ${order.user.last_name}` : 'Client'
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erreur suivi commande:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du suivi de la commande' },
      { status: 500 }
    );
  }
}

function generateTrackingEvents(status: string, createdAt: string, estimatedDelivery?: string) {
  const events = [];
  const createdDate = new Date(createdAt);
  
  // Événement de confirmation
  events.push({
    id: 1,
    status: 'confirmed',
    label: 'Commande confirmée',
    description: 'Votre commande a été confirmée et est en cours de traitement',
    timestamp: new Date(createdDate.getTime() + 30 * 60 * 1000).toISOString(), // +30 min
    location: 'JomionStore, Cotonou'
  });

  if (['processing', 'shipped', 'in_transit', 'delivered'].includes(status)) {
    // Événement de préparation
    events.push({
      id: 2,
      status: 'processing',
      label: 'En préparation',
      description: 'Votre commande est en cours de préparation dans notre entrepôt',
      timestamp: new Date(createdDate.getTime() + 2 * 60 * 60 * 1000).toISOString(), // +2h
      location: 'Entrepôt JomionStore, Cotonou'
    });
  }

  if (['shipped', 'in_transit', 'delivered'].includes(status)) {
    // Événement d'expédition
    events.push({
      id: 3,
      status: 'shipped',
      label: 'Expédiée',
      description: 'Votre colis a été expédié et est en route vers vous',
      timestamp: new Date(createdDate.getTime() + 24 * 60 * 60 * 1000).toISOString(), // +1 jour
      location: 'Entrepôt JomionStore, Cotonou'
    });
  }

  if (['in_transit', 'delivered'].includes(status)) {
    // Événement en transit
    events.push({
      id: 4,
      status: 'in_transit',
      label: 'En transit',
      description: 'Votre colis est en cours de livraison',
      timestamp: new Date(createdDate.getTime() + 48 * 60 * 60 * 1000).toISOString(), // +2 jours
      location: 'En route vers votre destination'
    });
  }

  if (status === 'delivered') {
    // Événement de livraison
    events.push({
      id: 5,
      status: 'delivered',
      label: 'Livrée',
      description: 'Votre colis a été livré avec succès',
      timestamp: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : new Date(createdDate.getTime() + 72 * 60 * 60 * 1000).toISOString(),
      location: 'Livré à votre adresse'
    });
  }

  return events;
}