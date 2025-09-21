import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock payment methods data
    const paymentMethods = {
      mobile_money: {
        name: 'Mobile Money',
        providers: ['MTN', 'Moov', 'Orange Money'],
        description: 'Paiement via Mobile Money',
        icon: '📱'
      },
      bank_transfer: {
        name: 'Virement Bancaire',
        banks: ['Ecobank', 'UBA', 'BOA', 'Coris Bank'],
        description: 'Virement bancaire direct',
        icon: '🏦'
      },
      cash_on_delivery: {
        name: 'Paiement à la Livraison',
        description: 'Payez en espèces à la réception',
        icon: '💰'
      }
    };

    return NextResponse.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    console.error('Payment info API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}