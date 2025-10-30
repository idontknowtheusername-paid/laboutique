import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressDropshipApiService, ProductSearchFilters } from '@/lib/services/aliexpress-dropship-api.service';

interface GenerateUrlsRequest {
  category_id: string;
  count: number;
  min_price?: number;
  max_price?: number;
  sort?: string;
}

// Mapping des catégories vers des mots-clés de recherche
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  '200000343': ['electronics', 'gadgets', 'tech', 'smart device'], // Electronics
  '200000345': ['fashion', 'clothing', 'style', 'trendy'], // Fashion
  '509': ['home', 'decor', 'furniture', 'kitchen'], // Home & Garden
  '44': ['sports', 'fitness', 'outdoor', 'exercise'], // Sports
  '1420': ['beauty', 'cosmetics', 'skincare', 'makeup'], // Beauty
  '21': ['automotive', 'car', 'vehicle', 'parts'], // Automotive
  '1501': ['jewelry', 'accessories', 'watches', 'rings'], // Jewelry
  '200001996': ['toys', 'games', 'kids', 'children'], // Toys
  '200001075': ['tools', 'hardware', 'diy', 'construction'], // Tools
  '200000532': ['bags', 'luggage', 'backpack', 'handbag'] // Bags
};

/**
 * Génère de vraies URLs de produits individuels via l'API AliExpress
 */
async function generateRealProductUrls(params: GenerateUrlsRequest): Promise<string[]> {
  const { category_id, count, min_price, max_price, sort } = params;
  const apiService = getAliExpressDropshipApiService();
  
  console.log('[Generate URLs] Starting search for category:', category_id);
  
  // Obtenir les mots-clés pour cette catégorie
  const keywords = CATEGORY_KEYWORDS[category_id] || ['product', 'item', 'quality'];
  const urls: string[] = [];
  
  try {
    // Faire plusieurs recherches avec différents mots-clés pour diversifier
    const searchPromises = keywords.map(async (keyword) => {
      const filters: ProductSearchFilters = {
        keywords: keyword,
        category_id,
        min_price,
        max_price,
        sort: sort as any,
        page_size: Math.ceil(count / keywords.length) + 5, // Un peu plus pour compenser les doublons
        page_no: 1,
        ship_to_country: 'CI' // Côte d'Ivoire
      };
      
      console.log(`[Generate URLs] Searching with keyword: ${keyword}`);
      
      try {
        const products = await apiService.searchProducts(filters);
        return products.map(product => product.product_detail_url).filter(url => url);
      } catch (error) {
        console.error(`[Generate URLs] Search failed for keyword ${keyword}:`, error);
        return [];
      }
    });
    
    // Attendre toutes les recherches
    const results = await Promise.all(searchPromises);
    
    // Combiner tous les résultats
    const allUrls = results.flat();
    
    // Supprimer les doublons et limiter au nombre demandé
    const uniqueUrls = [...new Set(allUrls)];
    urls.push(...uniqueUrls.slice(0, count));
    
    console.log(`[Generate URLs] Found ${urls.length} unique product URLs`);
    
    // Si on n'a pas assez d'URLs, faire des recherches supplémentaires avec des pages différentes
    if (urls.length < count && keywords.length > 0) {
      console.log('[Generate URLs] Need more URLs, searching additional pages...');
      
      const additionalSearches = [];
      for (let page = 2; page <= 3 && urls.length < count; page++) {
        const keyword = keywords[0]; // Utiliser le premier mot-clé
        const filters: ProductSearchFilters = {
          keywords: keyword,
          category_id,
          min_price,
          max_price,
          sort: sort as any,
          page_size: count - urls.length,
          page_no: page,
          ship_to_country: 'CI'
        };
        
        additionalSearches.push(
          apiService.searchProducts(filters)
            .then(products => products.map(p => p.product_detail_url).filter(url => url))
            .catch(error => {
              console.error(`[Generate URLs] Additional search failed for page ${page}:`, error);
              return [];
            })
        );
      }
      
      if (additionalSearches.length > 0) {
        const additionalResults = await Promise.all(additionalSearches);
        const additionalUrls = additionalResults.flat();
        const newUniqueUrls = additionalUrls.filter(url => !urls.includes(url));
        urls.push(...newUniqueUrls.slice(0, count - urls.length));
      }
    }
    
  } catch (error) {
    console.error('[Generate URLs] API search failed:', error);
    
    // Fallback: générer des URLs de recherche si l'API échoue
    console.log('[Generate URLs] Falling back to search URLs...');
    return generateFallbackSearchUrls(params);
  }
  
  // Si on n'a toujours pas assez d'URLs, compléter avec des URLs de recherche
  if (urls.length < count) {
    console.log(`[Generate URLs] Only found ${urls.length}/${count} URLs, adding search URLs as fallback`);
    const fallbackUrls = generateFallbackSearchUrls({
      ...params,
      count: count - urls.length
    });
    urls.push(...fallbackUrls);
  }
  
  return urls.slice(0, count);
}

/**
 * Génère des URLs de recherche comme fallback
 */
function generateFallbackSearchUrls(params: GenerateUrlsRequest): string[] {
  const { category_id, count, min_price, max_price, sort } = params;
  const urls: string[] = [];
  
  const baseUrl = 'https://www.aliexpress.com/wholesale';
  const keywords = CATEGORY_KEYWORDS[category_id] || ['product', 'item'];
  
  const sortParams: Record<string, string> = {
    'sales_desc': 'total_tranpro_desc',
    'price_asc': 'price_asc',
    'price_desc': 'price_desc',
    'rating_desc': 'evaluate_rate_desc'
  };
  
  const urlsPerKeyword = Math.ceil(count / keywords.length);
  
  keywords.forEach((keyword) => {
    for (let i = 0; i < urlsPerKeyword && urls.length < count; i++) {
      const params = new URLSearchParams();
      
      params.append('SearchText', keyword);
      params.append('catId', category_id);
      
      if (min_price) params.append('minPrice', min_price.toString());
      if (max_price) params.append('maxPrice', max_price.toString());
      if (sort && sortParams[sort]) params.append('SortType', sortParams[sort]);
      
      const page = Math.floor(i / 5) + 1;
      if (page > 1) params.append('page', page.toString());
      
      const url = `${baseUrl}?${params.toString()}`;
      urls.push(url);
    }
  });
  
  return urls.slice(0, count);
}

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
