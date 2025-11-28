import { NextResponse } from 'next/server';
import { getAliExpressOAuthService } from '@/lib/services/aliexpress-oauth.service';
import { getAliExpressDropshipApiService } from '@/lib/services/aliexpress-dropship-api.service';

/**
 * GET /api/aliexpress/test-account-status
 * Vérifie le statut du compte AliExpress Dropship
 */
export async function GET() {
  try {
    const oauthService = getAliExpressOAuthService();
    const apiService = getAliExpressDropshipApiService();

    // 1. Vérifier le token OAuth
    console.log('[Account Status] Checking OAuth token...');
    const token = await oauthService.getValidToken();
    
    // 2. Tester l'API des catégories (devrait toujours fonctionner)
    console.log('[Account Status] Testing categories API...');
    const categoriesResponse = await (apiService as any).callApi('aliexpress.ds.category.get', {});
    const categoriesWork = !!(categoriesResponse.aliexpress_ds_category_get_response?.resp_result);

    // 3. Tester un feed simple
    console.log('[Account Status] Testing feed API...');
    const feedResponse = await (apiService as any).callApi('aliexpress.ds.recommend.feed.get', {
      feed_name: 'ds-bestselling',
      page_size: 1,
      page_no: 1
    });
    
    const feedResult = feedResponse.aliexpress_ds_recommend_feed_get_response?.result;

    // 4. Tester avec différents pays
    console.log('[Account Status] Testing with different countries...');
    const countries = ['US', 'FR', 'BJ', 'CN'];
    const countryResults: any = {};

    for (const country of countries) {
      const response = await (apiService as any).callApi('aliexpress.ds.recommend.feed.get', {
        feed_name: 'ds-bestselling',
        ship_to_country: country,
        page_size: 5,
        page_no: 1
      });
      
      const result = response.aliexpress_ds_recommend_feed_get_response?.result;
      countryResults[country] = {
        total_record_count: result?.total_record_count || 0,
        current_record_count: result?.current_record_count || 0,
        has_products: !!(result?.products?.product)
      };
    }

    return NextResponse.json({
      success: true,
      account_status: {
        oauth_token_valid: !!token,
        token_length: token?.length || 0,
        categories_api_works: categoriesWork,
        feed_api_works: !!feedResult,
        feed_returns_products: !!(feedResult?.products?.product),
        feed_total_records: feedResult?.total_record_count || 0
      },
      country_tests: countryResults,
      recommendations: generateRecommendations(categoriesWork, feedResult, countryResults)
    });

  } catch (error) {
    console.error('[Account Status] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

function generateRecommendations(categoriesWork: boolean, feedResult: any, countryResults: any): string[] {
  const recommendations: string[] = [];

  if (!categoriesWork) {
    recommendations.push('❌ L\'API des catégories ne fonctionne pas - Vérifiez vos credentials OAuth');
  }

  if (!feedResult) {
    recommendations.push('❌ L\'API des feeds ne répond pas correctement');
  } else if (!feedResult.products?.product) {
    recommendations.push('⚠️ Les feeds ne retournent aucun produit');
    
    const workingCountries = Object.entries(countryResults)
      .filter(([_, result]: [string, any]) => result.has_products)
      .map(([country]) => country);

    if (workingCountries.length > 0) {
      recommendations.push(`✅ Produits disponibles pour: ${workingCountries.join(', ')}`);
      recommendations.push(`💡 Changez ship_to_country vers: ${workingCountries[0]}`);
    } else {
      recommendations.push('❌ Aucun produit disponible pour aucun pays testé');
      recommendations.push('💡 Votre compte AliExpress n\'est peut-être pas approuvé pour le Dropship');
      recommendations.push('💡 Contactez le support AliExpress pour activer votre compte Dropship');
    }
  } else {
    recommendations.push('✅ Tout fonctionne correctement !');
  }

  return recommendations;
}
