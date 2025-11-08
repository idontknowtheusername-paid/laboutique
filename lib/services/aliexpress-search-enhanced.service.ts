import { getAliExpressDropshipApiService } from './aliexpress-dropship-api.service';

/**
 * Service de recherche amélioré avec filtrage côté serveur
 * Contourne les limitations de l'API AliExpress Dropship qui ne supporte pas
 * la recherche par mots-clés ou catégories
 */

interface AliExpressProduct {
  product_id: string;
  product_title: string;
  product_main_image_url: string;
  product_video_url?: string;
  product_small_image_urls?: string[];
  sale_price: string;
  original_price?: string;
  product_detail_url: string;
  evaluate_rate?: string;
  lastest_volume?: number;
}

export interface EnhancedSearchFilters {
  keywords?: string;
  category_keywords?: string[]; // Mots-clés liés à la catégorie
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  min_sales?: number;
  page_size?: number;
  feeds?: string[]; // Feeds à utiliser
}

export interface SearchResult {
  products: AliExpressProduct[];
  total_found: number;
  filtered_count: number;
  feeds_used: string[];
}

export class AliExpressSearchEnhancedService {
  private apiService = getAliExpressDropshipApiService();

  /**
   * Recherche améliorée avec filtrage côté serveur
   * 1. Récupère les produits de plusieurs feeds
   * 2. Filtre par mots-clés (titre)
   * 3. Filtre par prix
   * 4. Filtre par note et ventes
   * 5. Trie les résultats
   */
  async searchWithFilters(filters: EnhancedSearchFilters): Promise<SearchResult> {
    console.log('[Enhanced Search] 🔍 Recherche avec filtres:', filters);

    // Étape 1 : Récupérer les produits de plusieurs feeds
    const feeds = filters.feeds || ['ds-bestselling', 'ds-new-arrival', 'ds-promotion', 'ds-choice'];
    const productsPerFeed = Math.ceil((filters.page_size || 50) / feeds.length);

    console.log(`[Enhanced Search] 📡 Récupération depuis ${feeds.length} feeds (${productsPerFeed} produits/feed)`);

    const allProducts: AliExpressProduct[] = [];

    for (const feedName of feeds) {
      try {
        const feedProducts = await this.getProductsFromFeed(feedName, productsPerFeed);
        allProducts.push(...feedProducts);
        console.log(`[Enhanced Search] ✅ Feed "${feedName}": ${feedProducts.length} produits récupérés`);
      } catch (error) {
        console.error(`[Enhanced Search] ❌ Erreur feed "${feedName}":`, error);
      }
    }

    console.log(`[Enhanced Search] 📦 Total récupéré: ${allProducts.length} produits`);

    // Étape 2 : Supprimer les doublons
    const uniqueProducts = this.removeDuplicates(allProducts);
    console.log(`[Enhanced Search] 🔄 Après dédoublonnage: ${uniqueProducts.length} produits`);

    // Étape 3 : Filtrer par mots-clés
    let filteredProducts = uniqueProducts;

    if (filters.keywords || filters.category_keywords) {
      filteredProducts = this.filterByKeywords(
        filteredProducts,
        filters.keywords,
        filters.category_keywords
      );
      console.log(`[Enhanced Search] 🔤 Après filtrage mots-clés: ${filteredProducts.length} produits`);
    }

    // Étape 4 : Filtrer par prix
    if (filters.min_price || filters.max_price) {
      filteredProducts = this.filterByPrice(
        filteredProducts,
        filters.min_price,
        filters.max_price
      );
      console.log(`[Enhanced Search] 💰 Après filtrage prix: ${filteredProducts.length} produits`);
    }

    // Étape 5 : Filtrer par note et ventes
    if (filters.min_rating) {
      filteredProducts = this.filterByRating(filteredProducts, filters.min_rating);
      console.log(`[Enhanced Search] ⭐ Après filtrage note: ${filteredProducts.length} produits`);
    }

    if (filters.min_sales) {
      filteredProducts = this.filterBySales(filteredProducts, filters.min_sales);
      console.log(`[Enhanced Search] 📊 Après filtrage ventes: ${filteredProducts.length} produits`);
    }

    // Étape 6 : Trier par pertinence
    const sortedProducts = this.sortByRelevance(
      filteredProducts,
      filters.keywords,
      filters.category_keywords
    );

    // Limiter au nombre demandé
    const finalProducts = sortedProducts.slice(0, filters.page_size || 50);

    console.log(`[Enhanced Search] ✨ Résultat final: ${finalProducts.length} produits`);

    return {
      products: finalProducts,
      total_found: allProducts.length,
      filtered_count: filteredProducts.length,
      feeds_used: feeds,
    };
  }

  /**
   * Récupérer les produits d'un feed spécifique
   */
  private async getProductsFromFeed(feedName: string, count: number): Promise<AliExpressProduct[]> {
    try {
      // Essayer avec différents paramètres selon la documentation AliExpress
      const response = await this.apiService['callApi']('aliexpress.ds.recommend.feed.get', {
        feed_name: feedName,
        target_currency: 'USD',
        target_language: 'EN', // Changer FR -> EN (plus universel)
        ship_to_country: 'US', // Changer CI -> US (plus de produits disponibles)
        page_no: 1,
        page_size: Math.min(count, 50),
      });

      // DEBUG: Afficher la réponse complète
      console.log(`[Enhanced Search] 🔍 Réponse brute feed "${feedName}":`, JSON.stringify(response, null, 2).substring(0, 500));

      if (response.aliexpress_ds_recommend_feed_get_response) {
        const result = response.aliexpress_ds_recommend_feed_get_response.result;
        
        console.log(`[Enhanced Search] 📦 Result structure:`, {
          hasResult: !!result,
          hasProducts: !!result?.products,
          hasProductArray: !!result?.products?.product,
          productCount: result?.products?.product?.length || 0
        });

        if (result && result.products && result.products.product) {
          return result.products.product.map((item: any) => ({
            product_id: item.product_id || item.productId || '',
            product_title: item.product_title || item.subject || 'Produit sans nom',
            product_main_image_url: item.product_main_image_url || item.productMainImageUrl || '',
            product_video_url: item.product_video_url || item.productVideoUrl,
            product_small_image_urls: item.product_small_image_urls
              ? (typeof item.product_small_image_urls === 'string'
                ? item.product_small_image_urls.split(';')
                : item.product_small_image_urls)
              : [],
            sale_price: item.sale_price || item.salePrice || item.target_sale_price || '0',
            original_price: item.original_price || item.originalPrice || item.target_original_price,
            product_detail_url: item.product_detail_url || item.productDetailUrl || `https://www.aliexpress.com/item/${item.product_id}.html`,
            evaluate_rate: item.evaluate_rate || item.evaluateRate || '4.5',
            lastest_volume: item.lastest_volume || item.volume || 0,
          })).filter((p: AliExpressProduct) => p.product_id);
        }
      }

      return [];
    } catch (error) {
      console.error(`[Enhanced Search] Erreur récupération feed ${feedName}:`, error);
      return [];
    }
  }

  /**
   * Supprimer les doublons par product_id
   */
  private removeDuplicates(products: AliExpressProduct[]): AliExpressProduct[] {
    const seen = new Set<string>();
    return products.filter(product => {
      if (seen.has(product.product_id)) {
        return false;
      }
      seen.add(product.product_id);
      return true;
    });
  }

  /**
   * Filtrer par mots-clés dans le titre
   */
  private filterByKeywords(
    products: AliExpressProduct[],
    keywords?: string,
    categoryKeywords?: string[]
  ): AliExpressProduct[] {
    if (!keywords && (!categoryKeywords || categoryKeywords.length === 0)) {
      return products;
    }

    const allKeywords: string[] = [];
    
    if (keywords) {
      allKeywords.push(...keywords.toLowerCase().split(/\s+/));
    }
    
    if (categoryKeywords) {
      allKeywords.push(...categoryKeywords.map(k => k.toLowerCase()));
    }

    return products.filter(product => {
      const title = product.product_title.toLowerCase();
      // Le produit doit contenir au moins un des mots-clés
      return allKeywords.some(keyword => title.includes(keyword));
    });
  }

  /**
   * Filtrer par prix (conversion USD -> XOF)
   */
  private filterByPrice(
    products: AliExpressProduct[],
    minPrice?: number,
    maxPrice?: number
  ): AliExpressProduct[] {
    if (!minPrice && !maxPrice) {
      return products;
    }

    return products.filter(product => {
      const priceUSD = parseFloat(product.sale_price);
      if (isNaN(priceUSD)) return false;

      // Conversion USD -> XOF (~655 XOF = 1 USD)
      const priceXOF = priceUSD * 655;

      if (minPrice && priceXOF < minPrice) return false;
      if (maxPrice && priceXOF > maxPrice) return false;

      return true;
    });
  }

  /**
   * Filtrer par note minimale
   */
  private filterByRating(products: AliExpressProduct[], minRating: number): AliExpressProduct[] {
    return products.filter(product => {
      const rating = parseFloat(product.evaluate_rate || '0');
      return rating >= minRating;
    });
  }

  /**
   * Filtrer par nombre de ventes minimal
   */
  private filterBySales(products: AliExpressProduct[], minSales: number): AliExpressProduct[] {
    return products.filter(product => {
      return (product.lastest_volume || 0) >= minSales;
    });
  }

  /**
   * Trier par pertinence (score basé sur mots-clés, note, ventes)
   */
  private sortByRelevance(
    products: AliExpressProduct[],
    keywords?: string,
    categoryKeywords?: string[]
  ): AliExpressProduct[] {
    const allKeywords: string[] = [];
    
    if (keywords) {
      allKeywords.push(...keywords.toLowerCase().split(/\s+/));
    }
    
    if (categoryKeywords) {
      allKeywords.push(...categoryKeywords.map(k => k.toLowerCase()));
    }

    return products.sort((a, b) => {
      // Score de pertinence
      let scoreA = 0;
      let scoreB = 0;

      // Points pour correspondance mots-clés
      if (allKeywords.length > 0) {
        const titleA = a.product_title.toLowerCase();
        const titleB = b.product_title.toLowerCase();

        allKeywords.forEach(keyword => {
          if (titleA.includes(keyword)) scoreA += 10;
          if (titleB.includes(keyword)) scoreB += 10;
        });
      }

      // Points pour note
      scoreA += parseFloat(a.evaluate_rate || '0') * 2;
      scoreB += parseFloat(b.evaluate_rate || '0') * 2;

      // Points pour ventes (logarithmique pour éviter domination)
      scoreA += Math.log10((a.lastest_volume || 0) + 1);
      scoreB += Math.log10((b.lastest_volume || 0) + 1);

      return scoreB - scoreA;
    });
  }

  /**
   * Mapper les catégories AliExpress vers des mots-clés de recherche
   */
  getCategoryKeywords(categoryName: string): string[] {
    const categoryMap: Record<string, string[]> = {
      'electronics': ['phone', 'laptop', 'tablet', 'computer', 'electronic', 'tech', 'gadget'],
      'fashion': ['dress', 'shirt', 'pants', 'shoes', 'clothing', 'fashion', 'wear'],
      'home': ['home', 'kitchen', 'furniture', 'decor', 'living', 'bedroom'],
      'sports': ['sport', 'fitness', 'gym', 'outdoor', 'exercise', 'running'],
      'beauty': ['beauty', 'makeup', 'cosmetic', 'skincare', 'hair', 'nail'],
      'toys': ['toy', 'game', 'kids', 'children', 'baby', 'play'],
      'automotive': ['car', 'auto', 'vehicle', 'motorcycle', 'bike', 'parts'],
      'jewelry': ['jewelry', 'watch', 'ring', 'necklace', 'bracelet', 'earring'],
    };

    const lowerCategory = categoryName.toLowerCase();
    
    for (const [key, keywords] of Object.entries(categoryMap)) {
      if (lowerCategory.includes(key)) {
        return keywords;
      }
    }

    return [];
  }
}

// Export singleton
let enhancedSearchInstance: AliExpressSearchEnhancedService | null = null;

export function getAliExpressSearchEnhancedService(): AliExpressSearchEnhancedService {
  if (!enhancedSearchInstance) {
    enhancedSearchInstance = new AliExpressSearchEnhancedService();
  }
  return enhancedSearchInstance;
}
