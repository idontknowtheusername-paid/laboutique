import crypto from 'crypto';
import { getAliExpressOAuthService } from './aliexpress-oauth.service';
import { getAliExpressSearchEnhancedService } from './aliexpress-search-enhanced.service';

/**
 * Service pour l'API officielle AliExpress Dropship
 * Documentation: https://openservice.aliexpress.com/doc/
 * Utilise OAuth 2.0 avec access_token
 */

interface AliExpressConfig {
  appKey: string;
  appSecret: string;
}

// Interface pour les produits Dropship
interface DropshipProduct {
  product_id: string;
  subject: string; // Nom du produit
  product_main_image_url?: string;
  product_small_image_urls?: string;
  ae_item_base_info_dto?: {
    product_id: string;
    subject: string;
    currency_code?: string;
    product_min_price?: string;
    product_max_price?: string;
  };
  ae_multimedia_info_dto?: {
    image_urls?: string;
    video_url?: string;
  };
  package_info_dto?: {
    package_height?: number;
    package_length?: number;
    package_width?: number;
    package_weight?: number;
  };
}

// Interface compatible avec l'ancien format
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

// Interface pour les filtres de recherche
export interface ProductSearchFilters {
  keywords: string;
  category_id?: string;
  min_price?: number;
  max_price?: number;
  min_sale_price?: number;
  max_sale_price?: number;
  sort?: 'sales_desc' | 'price_asc' | 'price_desc' | 'rating_desc';
  page_size?: number;
  page_no?: number;
  ship_to_country?: string;
}

export class AliExpressDropshipApiService {
  private config: AliExpressConfig;
  private baseUrl = 'https://api-sg.aliexpress.com/sync';
  private oauthService = getAliExpressOAuthService();

  constructor(config?: AliExpressConfig) {
    this.config = config || {
      appKey: process.env.ALIEXPRESS_APP_KEY || '',
      appSecret: process.env.ALIEXPRESS_APP_SECRET || '',
    };

    if (!this.config.appKey || !this.config.appSecret) {
      throw new Error('ALIEXPRESS_APP_KEY et ALIEXPRESS_APP_SECRET sont requis');
    }
  }

  /**
   * Générer la signature HMAC-MD5 pour authentifier les requêtes
   */
  private generateSign(params: Record<string, any>): string {
    // Trier les paramètres par clé
    const sortedKeys = Object.keys(params).sort();

    // Construire la chaîne à signer
    let signString = this.config.appSecret;
    for (const key of sortedKeys) {
      if (params[key] !== undefined && params[key] !== null) {
        signString += key + params[key];
      }
    }
    signString += this.config.appSecret;

    // Générer signature MD5
    return crypto.createHash('md5').update(signString, 'utf8').digest('hex').toUpperCase();
  }

  /**
   * Faire un appel à l'API AliExpress Dropship avec OAuth
   */
  private async callApi(method: string, params: Record<string, any> = {}): Promise<any> {
    const timestamp = Date.now().toString();

    // Récupérer un access_token valide (refresh automatique si expiré)
    const accessToken = await this.oauthService.getValidToken();

    const requestParams: Record<string, any> = {
      app_key: this.config.appKey,
      access_token: accessToken, // ← OAuth token
      method,
      timestamp,
      sign_method: 'md5',
      format: 'json',
      v: '2.0',
      ...params,
    };

    // Générer la signature
    requestParams.sign = this.generateSign(requestParams);

    // Construire l'URL avec les paramètres
    const queryString = new URLSearchParams(requestParams).toString();
    const url = `${this.baseUrl}?${queryString}`;



    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AliExpress Dropship API] HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();



      // Vérifier les erreurs de l'API
      if (data.error_response) {
        console.error('[AliExpress Dropship API] API Error:', data.error_response);
        throw new Error(data.error_response.msg || 'Erreur API AliExpress');
      }

      return data;
    } catch (error) {
      console.error('[AliExpress Dropship API] Call failed:', error);
      throw error;
    }
  }

  /**
   * Extraire l'ID du produit depuis une URL AliExpress
   */
  extractProductId(url: string): string | null {
    try {
      // Format: https://www.aliexpress.com/item/1234567890.html
      const match = url.match(/\/item\/(\d+)\.html/);
      if (match) return match[1];

      // Format: https://fr.aliexpress.com/item/1234567890.html
      const match2 = url.match(/aliexpress\.com\/item\/(\d+)/);
      if (match2) return match2[1];

      // Format: product_id dans l'URL
      const urlObj = new URL(url);
      const productId = urlObj.searchParams.get('product_id');
      if (productId) return productId;

      return null;
    } catch (error) {
      console.error('[AliExpress Dropship API] Invalid URL:', url, error);
      return null;
    }
  }

  /**
   * Obtenir les détails d'un produit par son ID
   * Méthode: aliexpress.ds.product.get
   */
  async getProductDetails(productId: string): Promise<AliExpressProduct | null> {
    try {
      const params: Record<string, any> = {
        product_id: productId,
        target_currency: 'USD',
        target_language: 'FR',
        ship_to_country: 'BJ',
      };

      const response = await this.callApi('aliexpress.ds.product.get', params);

      // Parser la réponse Dropship API
      if (response.aliexpress_ds_product_get_response) {
        const result = response.aliexpress_ds_product_get_response.result;



        if (result && result.ae_item_base_info_dto) {
          const baseInfo = result.ae_item_base_info_dto;
          const multimediaInfo = result.ae_multimedia_info_dto || {};

          // Chercher les prix dans plusieurs endroits possibles
          let salePrice = baseInfo.product_min_price;
          let originalPrice = baseInfo.product_max_price;

          // Fallback 1: Chercher dans ae_item_sku_info_dtos (prix des variantes)
          if (!salePrice && result.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o) {
            const skus = result.ae_item_sku_info_dtos.ae_item_sku_info_d_t_o;
            const firstSku = Array.isArray(skus) ? skus[0] : skus;
            if (firstSku) {
              salePrice = firstSku.sku_price || firstSku.offer_sale_price || firstSku.s_k_u_price;
              originalPrice = firstSku.offer_bulk_sale_price || firstSku.sku_bulk_order_price;

            }
          }

          // Fallback 2: Chercher dans ae_item_properties (prix global)
          if (!salePrice && result.ae_item_properties) {
            salePrice = result.ae_item_properties.product_price;

          }

          // Fallback 3: Chercher directement dans result
          if (!salePrice) {
            salePrice = result.target_sale_price || result.target_app_sale_price || result.discount_price;
            originalPrice = result.target_original_price || result.original_price;

          }



          // Convertir au format unifié
          const product: AliExpressProduct = {
            product_id: baseInfo.product_id || productId,
            product_title: baseInfo.subject || 'Produit sans nom',
            product_main_image_url: multimediaInfo.image_urls?.split(';')[0] || '',
            product_video_url: multimediaInfo.video_url,
            product_small_image_urls: multimediaInfo.image_urls?.split(';').slice(1, 5) || [],
            sale_price: salePrice || '0',
            original_price: originalPrice,
            product_detail_url: `https://www.aliexpress.com/item/${productId}.html`,
            evaluate_rate: '4.5', // Default, API dropship ne retourne pas toujours ce champ
            lastest_volume: 0,
          };

          return product;
        }
      }

      return null;
    } catch (error) {
      console.error('[AliExpress Dropship API] getProductDetails failed:', error);
      throw error;
    }
  }

  /**
   * Obtenir les détails d'un produit par URL
   */
  async getProductByUrl(url: string): Promise<AliExpressProduct | null> {
    const productId = this.extractProductId(url);

    if (!productId) {
      throw new Error('Impossible d\'extraire l\'ID du produit depuis l\'URL');
    }

    return this.getProductDetails(productId);
  }

  /**
   * Rechercher des produits avec filtrage amélioré côté serveur
   * Utilise le service de recherche amélioré qui contourne les limitations de l'API
   */
  async searchProducts(filters: ProductSearchFilters): Promise<AliExpressProduct[]> {
    try {
      console.log('[AliExpress Dropship API] 🔍 Recherche avec filtres:', filters);

      // Utiliser le service de recherche amélioré
      const enhancedService = getAliExpressSearchEnhancedService();

      // Mapper les catégories vers des mots-clés si nécessaire
      let categoryKeywords: string[] = [];
      if (filters.category_id) {
        categoryKeywords = enhancedService.getCategoryKeywords(filters.category_id);
        console.log(`[AliExpress Dropship API] 📂 Catégorie "${filters.category_id}" → Mots-clés:`, categoryKeywords);
      }

      // Effectuer la recherche améliorée
      const result = await enhancedService.searchWithFilters({
        keywords: filters.keywords,
        category_keywords: categoryKeywords.length > 0 ? categoryKeywords : undefined,
        min_price: filters.min_price,
        max_price: filters.max_price,
        page_size: filters.page_size || 50,
        feeds: ['ds-bestselling', 'ds-new-arrival', 'ds-promotion', 'ds-choice'],
      });

      console.log(`[AliExpress Dropship API] ✅ Recherche terminée: ${result.products.length} produits trouvés`);
      console.log(`[AliExpress Dropship API] 📊 Stats: ${result.total_found} récupérés, ${result.filtered_count} après filtrage`);

      return result.products;
    } catch (error) {
      console.error('[AliExpress Dropship API] ❌ searchProducts failed:', error);
      throw error;
    }
  }

  /**
   * Convertir un produit AliExpress en format utilisable par notre système
   */
  convertToScrapedProductData(product: AliExpressProduct, sourceUrl: string) {
    // Extraire les images
    const images: string[] = [];

    // Image principale
    if (product.product_main_image_url) {
      images.push(product.product_main_image_url);
    }

    // Images supplémentaires
    if (product.product_small_image_urls) {
      const smallImagesRaw = product.product_small_image_urls as string | string[];
      const smallImages = typeof smallImagesRaw === 'string'
        ? smallImagesRaw.split(',')
        : smallImagesRaw;
      images.push(...smallImages.slice(0, 4)); // Max 5 images au total
    }

    // Parser les prix - ROBUSTE pour string ET number
    const parsePrice = (priceStr: string | number | undefined): number => {
      if (!priceStr) return 0;

      // Convertir en string si c'est un nombre
      const priceAsString = typeof priceStr === 'number' ? priceStr.toString() : priceStr;

      // Nettoyer et parser
      const cleaned = priceAsString.replace(/[^\d.]/g, '');
      const price = parseFloat(cleaned);

      if (isNaN(price) || price <= 0) return 0;

      // USD to XOF conversion (~655 XOF = 1 USD)
      return Math.round(price * 655);
    };



    const salePrice = parsePrice(product.sale_price);
    const originalPrice = parsePrice(product.original_price);



    // Prix final avec fallback
    const finalPrice = salePrice || 15000; // Prix par défaut: 15000 XOF

    // Prix original : si existe et > prix vente, sinon +30% du prix vente, sinon undefined
    let finalOriginalPrice: number | undefined;
    if (originalPrice > 0 && originalPrice > finalPrice) {
      finalOriginalPrice = originalPrice;
    } else if (finalPrice > 0) {
      finalOriginalPrice = Math.round(finalPrice * 1.3);
    }

    return {
      name: product.product_title.slice(0, 200),
      price: finalPrice,
      original_price: finalOriginalPrice,
      images: images.filter(img => img && img.startsWith('http')),
      description: `${product.product_title}\n\nProduit importé depuis AliExpress via Dropship API.\n\nCaractéristiques:\n- Note: ${product.evaluate_rate || 'N/A'}\n- Ventes récentes: ${product.lastest_volume || 0}`,
      short_description: product.product_title.slice(0, 150),
      sku: `AE-DS-${product.product_id}`,
      stock_quantity: 100,
      source_url: product.product_detail_url || sourceUrl,
      source_platform: 'aliexpress' as const,
      specifications: {
        'Product ID': product.product_id,
        'Évaluation': product.evaluate_rate || 'N/A',
        'Ventes': product.lastest_volume?.toString() || '0',
        'API': 'Dropship OAuth',
        'Importé le': new Date().toLocaleDateString('fr-FR'),
      },
    };
  }

  /**
   * Récupérer des produits via plusieurs feeds pour diversifier
   * Utilise les feeds disponibles : ds-bestselling, ds-new-arrival, ds-promotion, ds-choice
   */
  async getProductsFromMultipleFeeds(count: number, page: number = 1): Promise<AliExpressProduct[]> {
    const feeds = ['ds-bestselling', 'ds-new-arrival', 'ds-promotion', 'ds-choice'];
    const productsPerFeed = Math.ceil(count / feeds.length);



    const feedPromises = feeds.map(async (feedName) => {
      try {
        const params: Record<string, any> = {
          feed_name: feedName,
          target_currency: 'USD',
          target_language: 'FR',
          ship_to_country: 'CI',
          page_no: page,
          page_size: Math.min(productsPerFeed, 50),
        };

        const response = await this.callApi('aliexpress.ds.recommend.feed.get', params);
        if (response.aliexpress_ds_recommend_feed_get_response) {
          const result = response.aliexpress_ds_recommend_feed_get_response.result;

          if (result && result.products && result.products.product) {
            const products = result.products.product;


            return products.map((item: any) => {
              const product: AliExpressProduct = {
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
              };

              return product;
            }).filter((p: AliExpressProduct) => p.product_id);
          }
        }

        return [];
      } catch (error) {
        console.error(`[AliExpress Dropship API] Feed ${feedName} failed:`, error);
        return [];
      }
    });
    const results = await Promise.all(feedPromises);
    const allProducts = results.flat();

    // Supprimer les doublons par product_id
    const uniqueProducts = allProducts.filter((product, index, self) =>
      index === self.findIndex(p => p.product_id === product.product_id)
    );


    return uniqueProducts.slice(0, count);
  }
}

// Export singleton
let apiServiceInstance: AliExpressDropshipApiService | null = null;

export function getAliExpressDropshipApiService(): AliExpressDropshipApiService {
  if (!apiServiceInstance) {
    apiServiceInstance = new AliExpressDropshipApiService();
  }
  return apiServiceInstance;
}