import { NextRequest, NextResponse } from 'next/server';
import { NotificationsService } from '@/lib/services/notifications.service';
import { OrdersService } from '@/lib/services/orders.service';
import { ProductsService } from '@/lib/services/products.service';
import { VendorsService } from '@/lib/services/vendors.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let tasks = [];

    // Tâches de commandes en attente
    if (!type || type === 'orders') {
      const pendingOrders = await OrdersService.getAll(
        { status: 'pending' },
        { page: 1, limit: 10 }
      );
      
      if (pendingOrders.success && pendingOrders.data) {
        tasks.push(...pendingOrders.data.map(order => ({
          id: `order-${order.id}`,
          type: 'order',
          title: `Commande ${order.order_number} en attente`,
          priority: 'high',
          created_at: order.created_at,
          data: order
        })));
      }
    }

    // Tâches de produits à approuver
    if (!type || type === 'products') {
      const pendingProducts = await ProductsService.getAll(
        { status: 'draft' },
        { page: 1, limit: 10 }
      );
      
      if (pendingProducts.success && pendingProducts.data) {
        tasks.push(...pendingProducts.data.map(product => ({
          id: `product-${product.id}`,
          type: 'product',
          title: `Approuver ${product.name}`,
          priority: 'medium',
          created_at: product.created_at,
          data: product
        })));
      }
    }

    // Tâches de vendeurs en attente
    if (!type || type === 'vendors') {
      const pendingVendors = await VendorsService.getPending(10);
      
      if (pendingVendors.success && pendingVendors.data) {
        tasks.push(...pendingVendors.data.map(vendor => ({
          id: `vendor-${vendor.id}`,
          type: 'vendor',
          title: `Approuver vendeur ${vendor.name}`,
          priority: 'low',
          created_at: vendor.created_at,
          data: vendor
        })));
      }
    }

    // Tâches générales
    if (!type || type === 'general') {
      const generalTasks = await NotificationsService.getPendingTasks();
      if (generalTasks.success && generalTasks.data) {
        tasks.push(...generalTasks.data);
      }
    }

    return NextResponse.json({
      success: true,
      data: tasks,
      total: tasks.length
    });

  } catch (error) {
    console.error('Admin tasks API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, priority = 'medium', data } = body;

    const result = await NotificationsService.createAlert({
      type: 'info',
      message: title,
      count: 1,
      resolved: false
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}