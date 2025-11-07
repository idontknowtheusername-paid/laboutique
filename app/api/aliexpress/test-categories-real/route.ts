import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressDropshipApiService } from '@/lib/services/aliexpress-dropship-api.service';

/**
 * POST /api/aliexpress/test-categories-real
 * Teste la méthode aliexpress.ds.category.get pour récupérer les vraies catégories
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Test Categories Real] Testing aliexpress.ds.category.get...');
    
    const apiService = getAliExpressDropshipApiService();
    
    // Appeler directement l'API pour récupérer les catégories
    const response = await (apiService as any).callApi('aliexpress.ds.category.get', {
      // Aucun paramètre requis selon la doc
    });
    
    console.log('[Test Categories Real] Raw response:', JSON.stringify(response, null, 2));
    
    // Parser la réponse
    let categories = [];
    let success = false;
    let message = '';
    let totalCount = 0;
    
    if (response.aliexpress_ds_category_get_response) {
      const respResult = response.aliexpress_ds_category_get_response.resp_result;
      
      if (respResult && respResult.result) {
        const result = respResult.result;
        totalCount = result.total_result_count || 0;
        
        if (result.categories && result.categories.category) {
          categories = Array.isArray(result.categories.category) 
            ? result.categories.category 
            : [result.categories.category];
          success = true;
          message = `${categories.length} catégories trouvées (total: ${totalCount})`;
        } else {
          message = 'Aucune catégorie dans result.categories';
        }
      } else {
        message = 'Pas de resp_result.result dans la réponse';
      }
    } else if (response.error_response) {
      message = `Erreur API: ${response.error_response.msg || 'Erreur inconnue'}`;
    } else {
      message = 'Format de réponse inattendu';
    }
    
    // Organiser les catégories par parent
    const topLevelCategories = categories.filter((cat: any) => !cat.parent_category_id);
    const childCategories = categories.filter((cat: any) => cat.parent_category_id);
    
    return NextResponse.json({
      success,
      message,
      total_count: totalCount,
      categories_returned: categories.length,
      top_level_categories: topLevelCategories.length,
      child_categories: childCategories.length,
      categories: categories.slice(0, 30), // Afficher 30 premières
      sample_top_level: topLevelCategories.slice(0, 10),
      sample_with_children: topLevelCategories.slice(0, 5).map((parent: any) => ({
        ...parent,
        children: childCategories.filter((child: any) => child.parent_category_id === parent.category_id).slice(0, 5)
      }))
    });

  } catch (error) {
    console.error('[Test Categories Real] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du test des catégories',
      details: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}