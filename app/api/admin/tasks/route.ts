import { NextRequest, NextResponse } from 'next/server';
import { OrdersService } from '@/lib/services/orders.service';
import { ProductsService } from '@/lib/services/products.service';

export async function GET(request: NextRequest) {
  try {
    const tasks = [];

    // Tâches de commandes en attente
    try {
      const pendingOrders = await OrdersService.getAll(
        { status: 'pending' },
        { page: 1, limit: 5 }
      );
      
      if (pendingOrders.success && pendingOrders.data && pendingOrders.data.length > 0) {
        tasks.push({
          id: 'pending-orders',
          title: `${pendingOrders.data.length} commandes en attente de traitement`,
          priority: 'high'
        });
      }
    } catch (err) {
      console.warn('Erreur tâches commandes:', err);
    }

    // Tâches de produits brouillon
    try {
      const draftProducts = await ProductsService.getAll(
        { status: 'draft' },
        { page: 1, limit: 5 }
      );
      
      if (draftProducts.success && draftProducts.data && draftProducts.data.length > 0) {
        tasks.push({
          id: 'draft-products',
          title: `${draftProducts.data.length} produits en brouillon à publier`,
          priority: 'medium'
        });
      }
    } catch (err) {
      console.warn('Erreur tâches produits:', err);
    }

    return NextResponse.json({
      success: true,
      data: tasks,
      total: tasks.length
    });

  } catch (error) {
    console.error('Admin tasks API error:', error);
    return NextResponse.json({
      success: true,
      data: [],
      total: 0
    });
  }
}

// POST désactivé - les tâches sont générées automatiquement