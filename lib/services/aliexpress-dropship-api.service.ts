import crypto from 'crypto';
import { getAliExpressOAuthService } from './aliexpress-oauth.service';

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

    console.log('[AliExpress Dropship API] Calling:', method);

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
      
      console.log('[AliExpress Dropship API] Response received');

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
          
          // Convertir au format unifié
          const product: AliExpressProduct = {
            product_id: baseInfo.product_id || productId,
            product_title: baseInfo.subject || 'Produit sans nom',
            product_main_image_url: multimediaInfo.image_urls?.split(';')[0] || '',
            product_video_url: multimediaInfo.video_url,
            product_small_image_urls: multimediaInfo.image_urls?.split(';').slice(1, 5) || [],
            sale_price: baseInfo.product_min_price || '0',
            original_price: baseInfo.product_max_price,
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
   * Rechercher des produits par mots-clés et filtres
   * Méthode: aliexpress.ds.recommend.feed.get
   */
  async searchProducts(filters: ProductSearchFilters): Promise<AliExpressProduct[]> {
    try {
      const params: Record<string, any> = {
        target_currency: 'USD',
        target_language: 'FR',
        ship_to_country: filters.ship_to_country || 'BJ',
        page_no: filters.page_no || 1,
        page_size: Math.min(filters.page_size || 50, 100), // Max 100 par page
      };

      // Ajouter les filtres optionnels
      if (filters.keywords) params.keywords = filters.keywords;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.min_sale_price) params.min_sale_price = filters.min_sale_price;
      if (filters.max_sale_price) params.max_sale_price = filters.max_sale_price;
      if (filters.sort) params.sort = filters.sort;

      console.log('[AliExpress Dropship API] Searching products with filters:', filters);

      const response = await this.callApi('aliexpress.ds.recommend.feed.get', params);

      // Parser la réponse
      if (response.aliexpress_ds_recommend_feed_get_response) {
        const result = response.aliexpress_ds_recommend_feed_get_response.result;

        if (result && result.products && result.products.product) {
          const products = result.products.product;

          console.log(`[AliExpress Dropship API] Found ${products.length} products`);

          // Convertir chaque produit au format unifié
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
          }).filter((p: AliExpressProduct) => p.product_id); // Filtrer les produits sans ID
        }
      }

      console.log('[AliExpress Dropship API] No products found');
      return [];
    } catch (error) {
      console.error('[AliExpress Dropship API] searchProducts failed:', error);
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

    // Parser les prix
    const parsePrice = (priceStr: string | undefined): number => {
      if (!priceStr) return 0;
      const cleaned = priceStr.replace(/[^\d.]/g, '');
      const price = parseFloat(cleaned);
      return isNaN(price) ? 0 : Math.round(price * 655); // USD to XOF conversion (~655 XOF = 1 USD)
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
}

// Export singleton
let apiServiceInstance: AliExpressDropshipApiService | null = null;

export function getAliExpressDropshipApiService(): AliExpressDropshipApiService {
  if (!apiServiceInstance) {
    apiServiceInstance = new AliExpressDropshipApiService();
  }
  return apiServiceInstance;
}
