import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressDropshipApiService } from '@/lib/services/aliexpress-dropship-api.service';

export async function POST(request: NextRequest) {
  try {
    const { method, params } = await request.json();
    
    console.log(`[Test Other Method] Testing method: ${method}`);
    
    const apiService = getAliExpressDropshipApiService();
    
    // Paramètres de base
    const apiParams = {
      target_currency: 'USD',
      target_language: 'EN',
      ship_to_country: 'US',
      page_size: 5,
      page_no: 1,
      ...params
    };

    console.log(`[Test Other Method] Params:`, apiParams);
    
    try {
      const response = await (apiService as any).callApi(method, apiParams);
      
      console.log(`[Test Other Method] Response for ${method}:`, JSON.stringify(response, null, 2));
      
      // Essayer de parser différents formats de réponse
      let products = [];
      let productCount = 0;
      
      // Format 1: recommend.feed.get
      if (response?.aliexpress_ds_recommend_feed_get_response?.result?.products?.product) {
        products = response.aliexpress_ds_recommend_feed_get_response.result.products.product;
      }
      
      // Format 2: product.search
      if (response?.aliexpress_ds_product_search_response?.result?.products) {
        products = response.aliexpress_ds_product_search_response.result.products;
      }
      
      // Format 3: category.product.get
      if (response?.aliexpress_ds_category_product_get_response?.result?.products) {
        products = response.aliexpress_ds_category_product_get_response.result.products;
      }
      
      // Format générique
      if (Array.isArray(products)) {
        productCount = products.length;
      }
      
      return NextResponse.json({
        success: true,
        method,
        productCount,
        hasResponse: !!response,
        responseKeys: Object.keys(response || {}),
        firstProduct: products[0] || null
      });

    } catch (apiError) {
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
      console.log(`[Test Other Method] API Error for ${method}:`, errorMessage);
      
      // Si c'est une erreur de méthode non supportée, c'est informatif
      if (errorMessage.includes('Invalid method') || errorMessage.includes('not found')) {
        return NextResponse.json({
          success: false,
          method,
          error: 'Méthode non supportée',
          isMethodError: true
        });
      }
      
      throw apiError;
    }

  } catch (error) {
    console.error('[Test Other Method] Fatal error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}