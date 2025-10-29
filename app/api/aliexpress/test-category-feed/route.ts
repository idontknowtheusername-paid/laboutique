import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressDropshipApiService } from '@/lib/services/aliexpress-dropship-api.service';

export async function POST(request: NextRequest) {
  try {
    const params = await request.json();
    
    console.log(`[Test Category Feed] Testing with params:`, params);
    
    const apiService = getAliExpressDropshipApiService();
    
    // Paramètres par défaut
    const apiParams: any = {
      feed_name: params.feed_name || 'ds-bestselling',
      page_size: params.page_size || 10,
      page_no: params.page_no || 1,
      target_currency: params.target_currency || 'USD',
      target_language: params.target_language || 'EN',
      ship_to_country: params.ship_to_country || 'US'
    };

    // Ajouter les paramètres optionnels
    if (params.category_id) apiParams.category_id = params.category_id;
    if (params.min_price) apiParams.min_price = params.min_price;
    if (params.max_price) apiParams.max_price = params.max_price;
    if (params.keywords) apiParams.keywords = params.keywords;
    if (params.sort) apiParams.sort = params.sort;

    console.log(`[Test Category Feed] API params:`, apiParams);
    
    const response = await (apiService as any).callApi('aliexpress.ds.recommend.feed.get', apiParams);
    
    console.log(`[Test Category Feed] Raw response:`, JSON.stringify(response, null, 2));
    
    const result = response?.aliexpress_ds_recommend_feed_get_response?.result;
    const products = result?.products?.product || [];
    
    return NextResponse.json({
      success: true,
      params: apiParams,
      productCount: products.length,
      totalRecords: result?.total_record_count || 0,
      isFinished: result?.is_finished || false,
      firstProduct: products[0] ? {
        id: products[0].product_id,
        title: products[0].product_title || products[0].subject,
        price: products[0].sale_price || products[0].target_sale_price,
        url: products[0].product_detail_url
      } : null,
      allProducts: products.slice(0, 3).map((p: any) => ({
        id: p.product_id,
        title: p.product_title || p.subject,
        price: p.sale_price || p.target_sale_price
      }))
    });

  } catch (error) {
    console.error('[Test Category Feed] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}