import { NextRequest, NextResponse } from 'next/server';
import { OrdersService } from '@/lib/services/orders.service';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-fedapay-signature') || '';
    const secret = process.env.FEDAPAY_WEBHOOK_SECRET;
    if (!secret) return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 });

    const payload = await request.text();

    // TODO: Verify signature according to FedaPay docs (HMAC). For now, accept in sandbox.
    // const isValid = verifyHmac(payload, signature, secret)
    // if (!isValid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

    const json = JSON.parse(payload || '{}');
    const eventType = json?.event || json?.type || '';
    const data = json?.data || json?.transaction || {};

    const reference = data?.reference || data?.id?.toString();
    const status = (data?.status || '').toLowerCase();
    const metadata = data?.metadata || {};
    const orderId = metadata?.order_id; // if we later pass order_id explicitly

    // Map FedaPay status -> local payment status
    let paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' = 'pending';
    let orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' = 'pending';
    if (status === 'approved' || status === 'completed' || status === 'paid') {
      paymentStatus = 'paid';
      orderStatus = 'confirmed';
    } else if (status === 'canceled' || status === 'failed') {
      paymentStatus = 'failed';
      orderStatus = 'cancelled';
    }

    if (orderId) {
      await OrdersService.update({ id: orderId, payment_status: paymentStatus, status: orderStatus, notes: `FedaPay ${reference}` } as any);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('FedaPay webhook error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

