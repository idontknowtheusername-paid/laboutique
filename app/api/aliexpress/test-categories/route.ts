import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressDropshipApiService } from '@/lib/services/aliexpress-dropship-api.service';

export async function POST(request: NextRequest) {
  try {
    console.log('[Test Categories] Starting API test...');
    
    const apiService = getAliExpressDropshipApiService();
    
    // Test 1: Méthode catégories
    try {
      console.log('[Test Categories] Testing aliexpress.ds.category.get...');
      const categoriesResponse = await (apiService as any).callApi('aliexpress.ds.category.get', {});
      
      return NextResponse.json({
        success: true,
        method: 'aliexpress.ds.category.get',
        data: categoriesResponse,
        message: 'Test catégories réussi'
      });
    } catch (error) {
      console.error('[Test Categories] Categories API failed:', error);
    }

    // Test 2: Méthode image search
    try {
      console.log('[Test Categories] Testing aliexpress.ds.image.search...');
      const imageResponse = await (apiService as any).callApi('aliexpress.ds.image.search', {
        image_url: 'https://example.com/test.jpg'
      });
      
      return NextResponse.json({
        success: true,
        method: 'aliexpress.ds.image.search',
        data: imageResponse,
        message: 'Test image search réussi'
      });
    } catch (error) {
      console.error('[Test Categories] Image search failed:', error);
    }

    // Test 3: Feeds alternatifs
    const feeds = ['ds-choice', 'ds-plus', 'ds-promotion'];
    const results: Record<string, any> = {};

    for (const feed of feeds) {
      try {
        console.log(`[Test Categories] Testing feed: ${feed}...`);
        const feedResponse = await (apiService as any).callApi('aliexpress.ds.recommend.feed.get', {
          feed_name: feed,
          page_size: 5,
          page_no: 1,
          target_currency: 'USD',
          target_language: 'FR',
          ship_to_country: 'BJ'
        });
        
        results[feed] = {
          success: true,
          hasProducts: feedResponse?.aliexpress_ds_recommend_feed_get_response?.result?.products?.product?.length > 0,
          productCount: feedResponse?.aliexpress_ds_recommend_feed_get_response?.result?.products?.product?.length || 0
        };
      } catch (error) {
        results[feed] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tests des feeds alternatifs terminés',
      feeds: results
    });

  } catch (error) {
    console.error('[Test Categories] Fatal error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}