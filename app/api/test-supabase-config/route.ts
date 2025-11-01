import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test de base - récupérer les catégories (public)
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(1);

    // Test d'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Test de requête authentifiée si utilisateur connecté
    let cartTest = null;
    if (user) {
      const { data: cart, error: cartError } = await supabase
        .from('cart_items')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      cartTest = { data: cart, error: cartError };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        ANON_KEY_PRESENT: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SERVICE_KEY_PRESENT: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      tests: {
        categories: { data: categories, error: catError },
        auth: { user: user?.id, error: authError },
        cart: cartTest
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}