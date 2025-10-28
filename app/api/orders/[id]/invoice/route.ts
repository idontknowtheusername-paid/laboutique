import { NextRequest, NextResponse } from 'next/server';
import { OrdersService } from '@/lib/services';

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const params = await context.params;
    const orderRes = await OrdersService.getById(params.id);
    if (!orderRes.success || !orderRes.data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Simple stub HTML invoice (to be replaced by real PDF generation)
    const o = orderRes.data;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Facture ${o.order_number}</title></head><body>
    <h1>Facture #${o.order_number}</h1>
    <p>Date: ${new Date(o.created_at).toLocaleString('fr-FR')}</p>
    <h2>Montants</h2>
    <ul>
      <li>Sous-total: ${o.subtotal} ${o.currency}</li>
      <li>Taxes: ${o.tax_amount} ${o.currency}</li>
      <li>Livraison: ${o.shipping_amount} ${o.currency}</li>
      <li>Remise: ${o.discount_amount} ${o.currency}</li>
      <li><strong>Total: ${o.total_amount} ${o.currency}</strong></li>
    </ul>
    </body></html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

