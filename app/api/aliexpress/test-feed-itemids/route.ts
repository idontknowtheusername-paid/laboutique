import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressDropshipApiService } from '@/lib/services/aliexpress-dropship-api.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category_id, feed_name = 'ds-bestselling', page_size = 10 } = body;

    console.log('[Test Feed ItemIDs] Testing with:', { category_id, feed_name, page_size });

    const apiService = getAliExpressDropshipApiService();

    // Tester l'API feed.itemids.get avec les bons paramètres
    const response = await apiService['callApi']('aliexpress.ds.feed.itemids.get', {
      feed_name: 'DS bestseller', // Format exact selon la doc
      category_id: category_id ? String(category_id) : undefined,
      page_size: page_size,
    });

    console.log('[Test Feed ItemIDs] Response:', JSON.stringify(response).substring(0, 500));

    // Parser la réponse
    if (response.aliexpress_ds_feed_itemids_get_response) {
      const result = response.aliexpress_ds_feed_itemids_get_response.result;
      
      if (result && result.item_list && result.item_list.item) {
        const items = Array.isArray(result.item_list.item) 
          ? result.item_list.item 
          : [result.item_list.item];
        
        const productIds = items.map((item: any) => item.item_id || item.product_id).filter(Boolean);
        
        return NextResponse.json({
          success: true,
          product_ids: productIds,
          count: productIds.length,
          raw_response: result,
        });
      }
    }

    return NextResponse.json({
      success: false,
      message: 'Aucun produit trouvé',
      response: response,
    });

  } catch (error: any) {
    console.error('[Test Feed ItemIDs] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
