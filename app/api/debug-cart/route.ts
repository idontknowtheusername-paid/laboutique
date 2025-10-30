import { NextRequest, NextResponse } from 'next/server';
import { validateCartItems } from '@/lib/helpers/validate-cart';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    console.log('[Debug Cart] Items reçus:', JSON.stringify(items, null, 2));

    // Tester la validation
    const validation = await validateCartItems(items);
    
    console.log('[Debug Cart] Résultat validation:', validation);

    return NextResponse.json({
      success: true,
      received_items: items,
      validation_result: validation,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Debug Cart] Erreur:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}