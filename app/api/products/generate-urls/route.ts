import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressDropshipApiService, ProductSearchFilters } from '@/lib/services/aliexpress-dropship-api.service';

interface GenerateUrlsRequest {
  category_id: string;
  count: number;
  min_price?: number;
  max_price?: number;
  sort?: string;
}

// Les catégories ne sont plus utilisées car l'API AliExpress Dropship
// ne supporte que les feeds prédéfinis (ds-bestselling, ds-new-arrival, etc.)

/**
 * Génère de vraies URLs de produits individuels via l'API AliExpress
 * Utilise les feeds recommandés au lieu de la recherche par mots-clés
 */
async function generateRealProductUrls(params: GenerateUrlsRequest): Promise<string[]> {
  const { count } = params;
  const apiService = getAliExpressDropshipApiService();

  console.log('[Generate URLs] Fetching products from AliExpress feeds...');

  try {
    // Utiliser les feeds multiples pour récupérer des produits variés
    const products = await apiService.getProductsFromMultipleFeeds(count, 1);

    if (products.length === 0) {
      throw new Error('Aucun produit trouvé dans les feeds AliExpress');
    }

    // Extraire les URLs des produits
    const urls = products
      .map(product => product.product_detail_url)
      .filter(url => url && url.startsWith('http'));

    console.log(`[Generate URLs] Generated ${urls.length} product URLs from feeds`);

    return urls;

  } catch (error) {
    console.error('[Generate URLs] API feeds failed:', error);
    throw new Error(`Échec de récupération des feeds AliExpress: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

// Fonction fallback supprimée - on utilise maintenant seulement les feeds AliExpress

export async function POST(request: NextRequest) {
  try {
    const body: GenerateUrlsRequest = await request.json();
    const { category_id, count, min_price, max_price, sort } = body;

    if (!category_id) {
      return NextResponse.json({
        success: false,
        error: 'category_id est requis'
      }, { status: 400 });
    }

    if (!count || count < 1 || count > 100) {
      return NextResponse.json({
        success: false,
        error: 'count doit être entre 1 et 100'
      }, { status: 400 });
    }

    console.log('[Generate URLs] Request:', { category_id, count, min_price, max_price, sort });

    // Générer les URLs de produits via l'API AliExpress
    const urls = await generateRealProductUrls({
      category_id,
      count,
      min_price,
      max_price,
      sort
    });

    console.log(`[Generate URLs] Generated ${urls.length} URLs for category ${category_id}`);

    return NextResponse.json({
      success: true,
      urls,
      count: urls.length,
      category_id,
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
