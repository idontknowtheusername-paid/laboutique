import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressDropshipApiService } from '@/lib/services/aliexpress-dropship-api.service';

// Cache des catégories (1 heure)
let categoriesCache: {
  data: any[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 60 * 60 * 1000; // 1 heure

/**
 * GET /api/aliexpress/categories
 * Récupère toutes les catégories AliExpress disponibles
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier le cache
    if (categoriesCache && Date.now() - categoriesCache.timestamp < CACHE_DURATION) {
      console.log('[AliExpress Categories] Returning cached categories');
      return NextResponse.json({
        success: true,
        categories: categoriesCache.data,
        cached: true
      });
    }

    console.log('[AliExpress Categories] Fetching fresh categories from API...');
    
    const apiService = getAliExpressDropshipApiService();
    
    // Appeler l'API pour récupérer les catégories
    const response = await (apiService as any).callApi('aliexpress.ds.category.get', {});
    
    // Parser la réponse
    const respResult = response.aliexpress_ds_category_get_response?.resp_result;
    
    if (!respResult || !respResult.result) {
      return NextResponse.json({
        success: false,
        error: 'Format de réponse invalide'
      }, { status: 500 });
    }

    const result = respResult.result;
    const allCategories = Array.isArray(result.categories?.category)
      ? result.categories.category
      : [result.categories?.category].filter(Boolean);

    // Organiser les catégories
    const topLevelCategories = allCategories
      .filter(cat => !cat.parent_category_id)
      .map(cat => ({
        id: cat.category_id.toString(),
        name: cat.category_name,
        parent_id: null,
        has_children: allCategories.some(c => c.parent_category_id === cat.category_id)
      }));

    const childCategories = allCategories
      .filter(cat => cat.parent_category_id)
      .map(cat => ({
        id: cat.category_id.toString(),
        name: cat.category_name,
        parent_id: cat.parent_category_id.toString(),
        has_children: allCategories.some(c => c.parent_category_id === cat.category_id)
      }));

    const organizedCategories = [
      ...topLevelCategories,
      ...childCategories
    ];

    // Mettre en cache
    categoriesCache = {
      data: organizedCategories,
      timestamp: Date.now()
    };

    console.log(`[AliExpress Categories] Fetched ${organizedCategories.length} categories`);

    return NextResponse.json({
      success: true,
      categories: organizedCategories,
      total: organizedCategories.length,
      top_level: topLevelCategories.length,
      cached: false
    });

  } catch (error) {
    console.error('[AliExpress Categories] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la récupération des catégories'
    }, { status: 500 });
  }
}
