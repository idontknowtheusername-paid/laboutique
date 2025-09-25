import { NextRequest, NextResponse } from 'next/server';
import { FedaPayService } from '@/lib/services/fedapay.service';
import { OrdersService } from '@/lib/services/orders.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, items, customer } = body || {};

    if (!user_id || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing user_id or items' }, { status: 400 });
    }

    const subtotal = items.reduce((s: number, it: any) => s + (it.price * it.quantity), 0);
    const shipping = subtotal > 50000 ? 0 : 2000;
    const total = subtotal + shipping;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || '';
    const callback_url = `${appUrl}/checkout/success`;
    const webhook_url = `${appUrl}/api/fedapay/webhook`;

    // Create pending order first for idempotency and pass order_id in metadata
    const pendingOrder = await OrdersService.create({
      user_id,
      items,
      shipping_address: customer?.shipping_address || {},
      billing_address: customer?.billing_address || customer?.shipping_address || {},
      payment_method: 'fedapay',
      notes: 'Pending via FedaPay',
    } as any);

    const orderId = (pendingOrder?.data as any)?.id;

    const tx = await FedaPayService.createTransaction({
      amount: total,
      description: 'Commande La Boutique B',
      customer: {
        name: customer?.name,
        email: customer?.email,
        phone_number: customer?.phone,
      },
      metadata: { user_id, items, order_id: orderId },
      callback_url,
      webhook_url,
    });

    if (orderId) {
      await OrdersService.update({ id: orderId, notes: `FedaPay ref: ${tx.reference}` } as any);
    }

    return NextResponse.json({ success: true, payment_url: tx.payment_url, reference: tx.reference });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

