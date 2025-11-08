import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressDropshipApiService } from '@/lib/services/aliexpress-dropship-api.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * API de recherche AliExpress avec filtrage amélioré
 * POST /api/aliexpress/search
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      keywords,
      category_id,
      min_price,
      max_price,
      page_size = 50,
    } = body;

    console.log('[API Search] 🔍 Recherche avec paramètres:', {
      keywords,
      category_id,
      min_price,
      max_price,
      page_size,
    });

    // Utiliser le service AliExpress avec recherche améliorée
    const apiService = getAliExpressDropshipApiService();

    const products = await apiService.searchProducts({
      keywords,
      category_id,
      min_price,
      max_price,
      page_size,
    });

    console.log(`[API Search] ✅ ${products.length} produits trouvés`);

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
    });

  } catch (error: any) {
    console.error('[API Search] ❌ Erreur:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la recherche',
      },
      { status: 500 }
    );
  }
}
