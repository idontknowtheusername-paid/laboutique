import { NextResponse } from 'next/server';
import { getAliExpressDropshipApiService } from '@/lib/services/aliexpress-dropship-api.service';

/**
 * GET /api/aliexpress/test-feeds-advanced
 * Test avancé des feeds avec différentes combinaisons de paramètres
 */
export async function GET() {
  try {
    const apiService = getAliExpressDropshipApiService();
    const results: any[] = [];

    // Test 1: Feed sans paramètres optionnels
    console.log('[Test] Feed minimal...');
    try {
      const response1 = await (apiService as any).callApi('aliexpress.ds.recommend.feed.get', {
        feed_name: 'ds-bestselling'
      });
      results.push({
        test: 'Minimal (feed_name only)',
        params: { feed_name: 'ds-bestselling' },
        success: true,
        products: response1.aliexpress_ds_recommend_feed_get_response?.result?.current_record_count || 0,
        raw_response: response1.aliexpress_ds_recommend_feed_get_response?.result
      });
    } catch (error) {
      results.push({
        test: 'Minimal',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown'
      });
    }

    // Test 2: Feed avec target_language EN
    console.log('[Test] Feed avec EN...');
    try {
      const response2 = await (apiService as any).callApi('aliexpress.ds.recommend.feed.get', {
        feed_name: 'ds-bestselling',
        target_language: 'EN',
        page_size: 20
      });
      results.push({
        test: 'English language',
        params: { feed_name: 'ds-bestselling', target_language: 'EN', page_size: 20 },
        success: true,
        products: response2.aliexpress_ds_recommend_feed_get_response?.result?.current_record_count || 0
      });
    } catch (error) {
      results.push({
        test: 'English language',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown'
      });
    }

    // Test 3: Feed avec country US
    console.log('[Test] Feed avec US...');
    try {
      const response3 = await (apiService as any).callApi('aliexpress.ds.recommend.feed.get', {
        feed_name: 'ds-bestselling',
        target_language: 'EN',
        target_currency: 'USD',
        ship_to_country: 'US',
        page_size: 20
      });
      results.push({
        test: 'US market',
        params: { 
          feed_name: 'ds-bestselling', 
          target_language: 'EN',
          target_currency: 'USD',
          ship_to_country: 'US',
          page_size: 20
        },
        success: true,
        products: response3.aliexpress_ds_recommend_feed_get_response?.result?.current_record_count || 0
      });
    } catch (error) {
      results.push({
        test: 'US market',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown'
      });
    }

    // Test 4: Différents feeds
    const feeds = ['ds-bestselling', 'ds-new-arrival', 'ds-promotion', 'ds-choice', 'ds-plus'];
    for (const feed of feeds) {
      console.log(`[Test] Feed ${feed}...`);
      try {
        const response = await (apiService as any).callApi('aliexpress.ds.recommend.feed.get', {
          feed_name: feed,
          target_language: 'EN',
          page_size: 10
        });
        results.push({
          test: `Feed: ${feed}`,
          params: { feed_name: feed, target_language: 'EN', page_size: 10 },
          success: true,
          products: response.aliexpress_ds_recommend_feed_get_response?.result?.current_record_count || 0
        });
      } catch (error) {
        results.push({
          test: `Feed: ${feed}`,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown'
        });
      }
    }

    // Test 5: Essayer avec sort_by
    console.log('[Test] Feed avec sort...');
    try {
      const response5 = await (apiService as any).callApi('aliexpress.ds.recommend.feed.get', {
        feed_name: 'ds-bestselling',
        target_language: 'EN',
        page_size: 20,
        sort: 'SALE_PRICE_ASC'
      });
      results.push({
        test: 'With sort parameter',
        params: { 
          feed_name: 'ds-bestselling', 
          target_language: 'EN',
          page_size: 20,
          sort: 'SALE_PRICE_ASC'
        },
        success: true,
        products: response5.aliexpress_ds_recommend_feed_get_response?.result?.current_record_count || 0
      });
    } catch (error) {
      results.push({
        test: 'With sort parameter',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown'
      });
    }

    const workingTests = results.filter(r => r.success && r.products > 0);
    const totalProducts = results.reduce((sum, r) => sum + (r.products || 0), 0);

    return NextResponse.json({
      success: true,
      summary: {
        total_tests: results.length,
        successful_tests: results.filter(r => r.success).length,
        tests_with_products: workingTests.length,
        total_products_found: totalProducts
      },
      working_configurations: workingTests.length > 0 ? workingTests : null,
      all_results: results,
      recommendation: workingTests.length > 0 
        ? `✅ Utilisez cette config: ${JSON.stringify(workingTests[0].params)}`
        : '❌ Aucune configuration ne retourne de produits. Vérifiez votre compte AliExpress Dropship ou contactez leur support.'
    });

  } catch (error) {
    console.error('[Test Feeds Advanced] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
