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

    const o = orderRes.data;
    const orderDate = new Date(o.created_at).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const formatPrice = (price: number) => new Intl.NumberFormat('fr-BJ', {
      style: 'decimal',
      minimumFractionDigits: 0
    }).format(price || 0) + ' XOF';

    // Récupérer les infos d'adresse
    const shippingAddr = o.shipping_address as any;
    const clientName = shippingAddr?.full_name || shippingAddr?.name || 'Client';
    const clientPhone = shippingAddr?.phone || '';
    const clientAddress = shippingAddr?.address_line || shippingAddr?.address || '';
    const clientCity = shippingAddr?.city || '';

    // Générer les lignes de produits
    const itemsHtml = (o.order_items || []).map((item: any, idx: number) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${idx + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 500;">${item.product?.name || 'Produit'}</div>
          ${item.variant ? `<div style="font-size: 12px; color: #6b7280;">${item.variant}</div>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.price)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">${formatPrice(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${o.order_number} - JomionStore</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f3f4f6;
      padding: 20px;
      color: #1f2937;
      line-height: 1.5;
    }
    
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .invoice-header {
      background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
      color: white;
      padding: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .logo-section h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    
    .logo-section p {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .invoice-title {
      text-align: right;
    }
    
    .invoice-title h2 {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 2px;
    }
    
    .invoice-title .invoice-number {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 4px;
    }
    
    .invoice-body {
      padding: 30px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }
    
    .info-box h3 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #6b7280;
      margin-bottom: 10px;
      font-weight: 600;
    }
    
    .info-box .value {
      font-size: 15px;
      color: #1f2937;
    }
    
    .info-box .value strong {
      display: block;
      font-size: 16px;
      margin-bottom: 4px;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    .items-table thead {
      background: #f9fafb;
    }
    
    .items-table th {
      padding: 12px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .items-table th:nth-child(3),
    .items-table th:nth-child(4),
    .items-table th:nth-child(5) {
      text-align: center;
    }
    
    .items-table th:last-child {
      text-align: right;
    }
    
    .totals-section {
      display: flex;
      justify-content: flex-end;
    }
    
    .totals-box {
      width: 300px;
      background: #f9fafb;
      border-radius: 8px;
      padding: 20px;
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    
    .totals-row.discount {
      color: #16a34a;
    }
    
    .totals-row.total {
      border-top: 2px solid #e5e7eb;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 18px;
      font-weight: 700;
    }
    
    .totals-row.total .amount {
      color: #ea580c;
    }
    
    .invoice-footer {
      background: #f9fafb;
      padding: 25px 30px;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .company-info {
      font-size: 13px;
      color: #6b7280;
    }
    
    .company-info p {
      margin-bottom: 4px;
    }
    
    .payment-info {
      text-align: right;
    }
    
    .payment-badge {
      display: inline-block;
      background: #dcfce7;
      color: #16a34a;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
    }
    
    .thank-you {
      text-align: center;
      padding: 20px;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px dashed #e5e7eb;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .invoice-container {
        box-shadow: none;
        border-radius: 0;
      }
      .no-print {
        display: none;
      }
    }
    
    .print-button {
      display: block;
      width: 100%;
      max-width: 800px;
      margin: 20px auto;
      padding: 12px 24px;
      background: #ea580c;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .print-button:hover {
      background: #c2410c;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="invoice-header">
      <div class="logo-section">
        <h1>🛒 JOMIONSTORE</h1>
        <p>Centre commercial digital du Bénin</p>
      </div>
      <div class="invoice-title">
        <h2>FACTURE</h2>
        <div class="invoice-number">N° ${o.order_number}</div>
      </div>
    </div>
    
    <!-- Body -->
    <div class="invoice-body">
      <!-- Info Grid -->
      <div class="info-grid">
        <div class="info-box">
          <h3>Facturé à</h3>
          <div class="value">
            <strong>${clientName}</strong>
            ${clientPhone ? `<div>📞 ${clientPhone}</div>` : ''}
            ${clientAddress ? `<div>📍 ${clientAddress}</div>` : ''}
            ${clientCity ? `<div>${clientCity}, Bénin</div>` : ''}
          </div>
        </div>
        <div class="info-box" style="text-align: right;">
          <h3>Détails de la facture</h3>
          <div class="value">
            <div><strong>Date:</strong> ${orderDate}</div>
            <div><strong>Paiement:</strong> ${o.payment_method || 'Mobile Money'}</div>
            <div><strong>Statut:</strong> ${o.payment_status === 'paid' ? '✅ Payé' : '⏳ En attente'}</div>
          </div>
        </div>
      </div>
      
      <!-- Items Table -->
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>Description</th>
            <th style="width: 80px; text-align: center;">Qté</th>
            <th style="width: 120px; text-align: right;">Prix unit.</th>
            <th style="width: 120px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml || `
          <tr>
            <td colspan="5" style="padding: 20px; text-align: center; color: #6b7280;">
              Détails des articles non disponibles
            </td>
          </tr>
          `}
        </tbody>
      </table>
      
      <!-- Totals -->
      <div class="totals-section">
        <div class="totals-box">
          <div class="totals-row">
            <span>Sous-total</span>
            <span>${formatPrice(o.subtotal_amount || o.subtotal || 0)}</span>
          </div>
          ${(o.tax_amount && o.tax_amount > 0) ? `
          <div class="totals-row">
            <span>TVA (2%)</span>
            <span>${formatPrice(o.tax_amount)}</span>
          </div>
          ` : ''}
          <div class="totals-row">
            <span>Livraison</span>
            <span>${formatPrice(o.shipping_amount || 0)}</span>
          </div>
          ${(o.discount_amount && o.discount_amount > 0) ? `
          <div class="totals-row discount">
            <span>Réduction</span>
            <span>-${formatPrice(o.discount_amount)}</span>
          </div>
          ` : ''}
          <div class="totals-row total">
            <span>Total TTC</span>
            <span class="amount">${formatPrice(o.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="invoice-footer">
      <div class="footer-content">
        <div class="company-info">
          <p><strong>JomionStore SARL</strong></p>
          <p>📍 Cotonou, Bénin</p>
          <p>📞 +229 01 64 35 40 89</p>
          <p>✉️ contact@jomionstore.com</p>
        </div>
        <div class="payment-info">
          <span class="payment-badge">
            ${o.payment_status === 'paid' ? '✓ Paiement confirmé' : '⏳ Paiement en attente'}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Thank you -->
    <div class="thank-you">
      Merci pour votre confiance ! 🧡<br>
      <small>Pour toute question, contactez-nous sur WhatsApp ou par email.</small>
    </div>
  </div>
  
  <!-- Print Button -->
  <button class="print-button no-print" onclick="window.print()">
    🖨️ Imprimer / Télécharger PDF
  </button>
  
  <script>
    // Auto-print si paramètre ?print=true
    if (window.location.search.includes('print=true')) {
      window.print();
    }
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  } catch (e) {
    console.error('Invoice generation error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
