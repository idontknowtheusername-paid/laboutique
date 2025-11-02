import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock delivery info data
    const deliveryInfo = {
      standard: {
        name: 'Livraison Standard',
        price: 2000,
        duration: '3-5 jours ouvrés',
        description: 'Livraison standard dans tout le Bénin'
      },
      express: {
        name: 'Livraison Express',
        price: 5000,
        duration: '1-2 jours ouvrés',
        description: 'Livraison express pour Cotonou et environs'
      },
      free: {
        name: 'Livraison Gratuite',
        price: 0,
        duration: '3-5 jours ouvrés',
        description: 'Livraison gratuite pour commandes de plus de 200 000 FCFA'
      }
    };

    return NextResponse.json({
      success: true,
      data: deliveryInfo
    });
  } catch (error) {
    console.error('Delivery info API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}