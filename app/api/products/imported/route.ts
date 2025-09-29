import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const sourcePlatforms = searchParams.get('source_platform')?.split(',') || ['alibaba', 'aliexpress'];

    console.log('[API] Récupération des produits importés:', { limit, sourcePlatforms });

    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        short_description,
        price,
        compare_price,
        images,
        status,
        featured,
        source_platform,
        source_url,
        created_at,
        category:categories(id, name, slug),
        vendor:vendors(id, name, slug)
      `)
      .in('source_platform', sourcePlatforms)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[API] Erreur lors de la récupération des produits importés:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur lors de la récupération des produits',
          details: error.message 
        },
        { status: 500 }
      );
    }

    console.log('[API] Produits importés récupérés:', products?.length || 0);

    return NextResponse.json({
      success: true,
      data: products || [],
      count: products?.length || 0
    });

  } catch (error) {
    console.error('[API] Erreur inattendue:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur inattendue',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}