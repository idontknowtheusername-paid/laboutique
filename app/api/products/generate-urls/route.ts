import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressDropshipApiService, ProductSearchFilters } from '@/lib/services/aliexpress-dropship-api.service';

interface GenerateUrlsRequest {
  feed_type: string; // 'mixed' ou feed spécifique
  count: number;
  min_price?: number;
  max_price?: number;
  sort?: string;
}

// Les catégories ne sont plus utilisées car l'API AliExpress Dropship
// ne supporte que les feeds prédéfinis (ds-bestselling, ds-new-arrival, etc.)

/**
 * Génère de vraies URLs de produits individuels via l'API AliExpress
 * Utilise les feeds recommandés selon le type sélectionné
 */
async function generateRealProductUrls(params: GenerateUrlsRequest): Promise<string[]> {
  const { feed_type, count } = params;
  const apiService = getAliExpressDropshipApiService();

  console.log(`[Generate URLs] Using feed type: ${feed_type}, count: ${count}`);

  try {
    let products;

    if (feed_type === 'mixed') {
      // Utiliser les feeds multiples pour récupérer des produits variés
      products = await apiService.getProductsFromMultipleFeeds(count, 1);
    } else {
      // Utiliser un feed spécifique
      const filters: ProductSearchFilters = {
        keywords: '', // Pas utilisé pour les feeds
        page_size: Math.min(count, 100),
        page_no: 1,
        ship_to_country: 'BJ',
      };

      // Utiliser directement l'API avec le feed spécifique
      const response = await (apiService as any).callApi('aliexpress.ds.recommend.feed.get', {
        feed_name: feed_type,
        target_currency: 'USD',
        target_language: 'FR',
        ship_to_country: 'BJ',
        page_no: 1,
        page_size: Math.min(count, 100),
      });

      if (response.aliexpress_ds_recommend_feed_get_response) {
        const result = response.aliexpress_ds_recommend_feed_get_response.result;
        if (result && result.products && result.products.product) {
          const rawProducts = result.products.product;
          products = rawProducts.map((item: any) => ({
            product_id: item.product_id || item.productId || '',
            product_title: item.product_title || item.subject || 'Produit sans nom',
            product_detail_url: item.product_detail_url || item.productDetailUrl || `https://www.aliexpress.com/item/${item.product_id}.html`,
            // Autres champs...
          }));
        } else {
          products = [];
        }
      } else {
        products = [];
      }
    }

    if (products.length === 0) {
      throw new Error(`Aucun produit trouvé pour le feed ${feed_type}`);
    }

    // Extraire les URLs des produits
    const urls = products
      .map((product: any) => product.product_detail_url)
      .filter((url: string) => url && url.startsWith('http'));

    console.log(`[Generate URLs] Generated ${urls.length} URLs from feed ${feed_type}`);

    return urls;

  } catch (error) {
    console.error('[Generate URLs] API feeds failed:', error);
    throw new Error(`Échec de récupération du feed ${feed_type}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

// Fonction fallback supprimée - on utilise maintenant seulement les feeds AliExpress

export async function POST(request: NextRequest) {
  try {
    const body: GenerateUrlsRequest = await request.json();
    const { feed_type, count, min_price, max_price, sort } = body;

    if (!feed_type) {
      return NextResponse.json({
        success: false,
        error: 'feed_type est requis'
      }, { status: 400 });
    }

    if (!count || count < 1 || count > 100) {
      return NextResponse.json({
        success: false,
        error: 'count doit être entre 1 et 100'
      }, { status: 400 });
    }

    // Valider le feed_type
    const validFeeds = ['mixed', 'ds-bestselling', 'ds-new-arrival', 'ds-promotion', 'ds-choice'];
    if (!validFeeds.includes(feed_type)) {
      return NextResponse.json({
        success: false,
        error: `feed_type invalide. Valeurs acceptées: ${validFeeds.join(', ')}`
      }, { status: 400 });
    }

    console.log(`[Generate URLs] Request: feed_type=${feed_type}, count=${count}`);

    // Générer les URLs de produits via l'API AliExpress
    const urls = await generateRealProductUrls({
      feed_type,
      count,
      min_price,
      max_price,
      sort
    });

    console.log(`[Generate URLs] Success: ${urls.length} URLs generated`);

    return NextResponse.json({
      success: true,
      urls,
      count: urls.length,
      feed_type,
      source: 'aliexpress_api',
      filters: {
        min_price,
        max_price,
        sort
      }
    });

  } catch (error) {
    console.error('[Generate URLs] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la génération des URLs'
    }, { status: 500 });
  }
}
