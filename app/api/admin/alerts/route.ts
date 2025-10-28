import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const alerts = [];

    // Alertes de stock bas (produits avec quantity < 10)
    try {
      const { data: lowStockProducts } = await supabaseAdmin
        .from('products')
        .select('id, name, quantity')
        .lt('quantity', 10)
        .eq('status', 'active')
        .limit(5);

      if (lowStockProducts && lowStockProducts.length > 0) {
        alerts.push({
          id: 'low-stock',
          type: 'warning',
          message: `${lowStockProducts.length} produits en stock faible`,
          count: lowStockProducts.length
        });
      }
    } catch (err) {
      console.warn('Erreur alertes stock:', err);
    }

    // Alertes commandes en attente
    try {
      const { data: pendingOrders, count } = await supabaseAdmin
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      if (count && count > 0) {
        alerts.push({
          id: 'pending-orders',
          type: 'info',
          message: `${count} commandes en attente de traitement`,
          count
        });
      }
    } catch (err) {
      console.warn('Erreur alertes commandes:', err);
    }

    // Alertes produits sans catégorie
    try {
      const { data: uncategorized, count } = await supabaseAdmin
        .from('products')
        .select('id', { count: 'exact' })
        .is('category_id', null)
        .eq('status', 'active');

      if (count && count > 0) {
        alerts.push({
          id: 'uncategorized',
          type: 'warning',
          message: `${count} produits sans catégorie`,
          count
        });
      }
    } catch (err) {
      console.warn('Erreur alertes catégories:', err);
    }

    return NextResponse.json({
      success: true,
      data: alerts,
      total: alerts.length
    });

  } catch (error) {
    console.error('Admin alerts API error:', error);
    return NextResponse.json({
      success: true,
      data: [],
      total: 0
    });
  }
}

// POST désactivé - les alertes sont générées automatiquement