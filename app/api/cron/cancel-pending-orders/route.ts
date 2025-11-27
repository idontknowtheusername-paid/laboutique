import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Délai en heures après lequel une commande pending est annulée
const PENDING_TIMEOUT_HOURS = 24; // 24 heures

export async function GET(request: NextRequest) {
  try {
    // Vérifier le secret pour les appels cron (optionnel mais recommandé)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Calculer la date limite (commandes plus vieilles que X heures)
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - PENDING_TIMEOUT_HOURS);

    // Récupérer les commandes pending à annuler
    const { data: pendingOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, created_at, user_id')
      .eq('status', 'pending')
      .lt('created_at', cutoffDate.toISOString());

    if (fetchError) {
      console.error('Erreur récupération commandes pending:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!pendingOrders || pendingOrders.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Aucune commande à annuler',
        cancelled: 0 
      });
    }

    // Annuler les commandes
    const orderIds = pendingOrders.map(o => o.id);
    
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .in('id', orderIds);

    if (updateError) {
      console.error('Erreur annulation commandes:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Ajouter à l'historique pour chaque commande
    const historyEntries = pendingOrders.map(order => ({
      order_id: order.id,
      status_from: 'pending',
      status_to: 'cancelled',
      reason: `Annulation automatique après ${PENDING_TIMEOUT_HOURS}h sans paiement`,
      created_at: new Date().toISOString()
    }));

    await supabase.from('order_history').insert(historyEntries);

    console.log(`✅ ${pendingOrders.length} commandes annulées automatiquement`);

    return NextResponse.json({ 
      success: true, 
      message: `${pendingOrders.length} commandes annulées`,
      cancelled: pendingOrders.length,
      orders: pendingOrders.map(o => o.order_number)
    });

  } catch (error) {
    console.error('Erreur cron cancel-pending-orders:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Permettre aussi POST pour les appels manuels
export async function POST(request: NextRequest) {
  return GET(request);
}
