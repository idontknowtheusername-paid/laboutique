import { NextResponse } from 'next/server';
import { getAliExpressDropshipApiService } from '@/lib/services/aliexpress-dropship-api.service';

/**
 * GET /api/aliexpress/test-feeds
 * Test des différents feeds AliExpress
 */
export async function GET() {
  try {
    const apiService = getAliExpressDropshipApiService();
    const results: any = {};

    const feeds = ['ds-bestselling', 'ds-new-arrival', 'ds-promotion', 'ds-choice'];

    for (const feed of feeds) {
      console.log(`[Test Feeds] Testing ${feed}...`);
      
      try {
        const apiParams: any = {
          feed_name: feed,
          target_currency: 'USD',
          target_language: 'FR',
          ship_to_country: 'BJ',
          page_no: 1,
          page_size: 10,
        };

        const response = await (apiService as any).callApi('aliexpress.ds.recommend.feed.get', apiParams);
        
        if (response.aliexpress_ds_recommend_feed_get_response) {
          const result = response.aliexpress_ds_recommend_feed_get_response.result;
          
          results[feed] = {
            success: true,
            total_record_count: result.total_record_count || 0,
            current_record_count: result.current_record_count || 0,
            is_finished: result.is_finished,
            has_products: !!(result.products && result.products.product),
            product_count: result.products?.product ? 
              (Array.isArray(result.products.product) ? result.products.product.length : 1) : 0
          };

          if (result.products?.product) {
            const firstProduct = Array.isArray(result.products.product) 
              ? result.products.product[0] 
              : result.products.product;
            
            results[feed].sample_product = {
              id: firstProduct.product_id,
              title: firstProduct.product_title || firstProduct.subject,
              price: firstProduct.sale_price || firstProduct.target_sale_price
            };
          }
        } else {
          results[feed] = {
            success: false,
            error: 'Invalid response format'
          };
        }
      } catch (error) {
        results[feed] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total_feeds_tested: feeds.length,
        successful_feeds: Object.values(results).filter((r: any) => r.success).length,
        total_products_found: Object.values(results).reduce((sum: number, r: any) => 
          sum + (r.product_count || 0), 0)
      }
    });

  } catch (error) {
    console.error('[Test Feeds] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
