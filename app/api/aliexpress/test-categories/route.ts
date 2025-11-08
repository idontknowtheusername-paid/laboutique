import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressDropshipApiService } from '@/lib/services/aliexpress-dropship-api.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Test de l'API aliexpress.ds.category.get
 * POST /api/aliexpress/test-categories
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { language = 'en' } = body;

    console.log('[API Test Categories] 🔍 Récupération des catégories...');

    const apiService = getAliExpressDropshipApiService();

    // Appeler l'API category.get
    const response = await apiService['callApi']('aliexpress.ds.category.get', {
      language: language,
    });

    console.log('[API Test Categories] 📦 Réponse brute:', JSON.stringify(response).substring(0, 500));

    // Parser la réponse
    if (response.aliexpress_ds_category_get_response) {
      const result = response.aliexpress_ds_category_get_response;
      
      if (result.resp_result && result.resp_result.result) {
        const categories = result.resp_result.result.categories?.category || [];
        
        console.log(`[API Test Categories] ✅ ${categories.length} catégories trouvées`);

        return NextResponse.json({
          success: true,
          categories: categories,
          count: categories.length,
        });
      }
    }

    return NextResponse.json({
      success: false,
      message: 'Aucune catégorie trouvée',
      response: response,
    });

  } catch (error: any) {
    console.error('[API Test Categories] ❌ Erreur:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération des catégories',
      },
      { status: 500 }
    );
  }
}
