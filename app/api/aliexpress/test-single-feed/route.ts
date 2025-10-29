import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressDropshipApiService } from '@/lib/services/aliexpress-dropship-api.service';

export async function POST(request: NextRequest) {
  try {
    const { feed_name } = await request.json();
    
    console.log(`[Test Single Feed] Testing feed: ${feed_name}`);
    
    const apiService = getAliExpressDropshipApiService();
    
    const response = await (apiService as any).callApi('aliexpress.ds.recommend.feed.get', {
      feed_name: feed_name,
      page_size: 10,
      page_no: 1,
      target_currency: 'USD',
      target_language: 'FR',
      ship_to_country: 'BJ'
    });
    
    console.log(`[Test Single Feed] Raw response for ${feed_name}:`, JSON.stringify(response, null, 2));
    
    const result = response?.aliexpress_ds_recommend_feed_get_response?.result;
    const products = result?.products?.product || [];
    
    return NextResponse.json({
      success: true,
      feed_name,
      productCount: products.length,
      firstProduct: products[0] ? {
        id: products[0].product_id,
        title: products[0].product_title || products[0].subject,
        price: products[0].sale_price || products[0].target_sale_price
      } : null,
      rawResult: result
    });

  } catch (error) {
    console.error('[Test Single Feed] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}