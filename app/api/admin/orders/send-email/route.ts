import { NextRequest, NextResponse } from 'next/server';
import { BrevoService } from '@/lib/services/brevo.service';

export async function POST(request: NextRequest) {
  try {
    const {
      orderId,
      orderNumber,
      customerEmail,
      customerName,
      status,
      totalAmount,
      orderDate
    } = await request.json();

    if (!customerEmail || !orderNumber) {
      return NextResponse.json(
        { error: 'Email du client et numéro de commande requis' },
        { status: 400 }
      );
    }

    // Envoyer l'email via Brevo
    await BrevoService.sendOrderStatusEmail({
      email: customerEmail,
      name: customerName || 'Client',
      orderNumber,
      status: status || 'processing',
      totalAmount,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR') // +3 jours
    });

    return NextResponse.json({
      success: true,
      message: 'Email envoyé avec succès'
    });

  } catch (error: any) {
    console.error('Erreur envoi email admin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email', details: error.message },
      { status: 500 }
    );
  }
}