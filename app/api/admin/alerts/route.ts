import { NextRequest, NextResponse } from 'next/server';
import { NotificationsService } from '@/lib/services/notifications.service';
import { InventoryService } from '@/lib/services/inventory.service';
import { PaymentsService } from '@/lib/services/payments.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let alerts = [];

    // Alertes de stock
    if (!type || type === 'stock') {
      const stockAlerts = await InventoryService.getStockAlerts();
      if (stockAlerts.success && stockAlerts.data) {
        alerts.push(...stockAlerts.data.map(alert => ({
          id: `stock-${alert.id}`,
          type: 'warning',
          message: `${alert.product_name} - Stock: ${alert.current_stock}`,
          count: 1,
          created_at: alert.created_at,
          resolved: false
        })));
      }
    }

    // Alertes de paiement
    if (!type || type === 'payment') {
      const paymentAlerts = await PaymentsService.getPaymentAlerts();
      if (paymentAlerts.success && paymentAlerts.data) {
        alerts.push(...paymentAlerts.data.map(alert => ({
          id: `payment-${alert.id}`,
          type: 'error',
          message: `Paiement échoué - Commande ${alert.order_number}`,
          count: 1,
          created_at: alert.created_at,
          resolved: false
        })));
      }
    }

    // Alertes générales
    if (!type || type === 'general') {
      const generalAlerts = await NotificationsService.getAlerts();
      if (generalAlerts.success && generalAlerts.data) {
        alerts.push(...generalAlerts.data);
      }
    }

    return NextResponse.json({
      success: true,
      data: alerts,
      total: alerts.length
    });

  } catch (error) {
    console.error('Admin alerts API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, message, count = 1 } = body;

    const result = await NotificationsService.createAlert({
      type,
      message,
      count,
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
    console.error('Create alert error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}