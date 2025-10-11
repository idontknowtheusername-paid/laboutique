import crypto from 'crypto';

/**
 * Service pour l'API officielle AliExpress
 * Documentation: https://openservice.aliexpress.com/doc/
 */

interface AliExpressConfig {
  appKey: string;
  appSecret: string;
  trackingId?: string;
}

interface ProductDetails {
  product_id: string;
  product_title: string;
  product_main_image_url: string;
  product_video_url?: string;
  category_id: string;
  original_price: string;
  sale_price: string;
  discount?: string;
  evaluation_rate?: string;
  commission_rate?: string;
  lastest_volume?: number;
  product_detail_url: string;
  promotion_link?: string;
  sale_price_with_currency?: string;
  original_price_with_currency?: string;
}

interface AliExpressProduct {
  product_id: string;
  product_title: string;
  product_main_image_url: string;
  product_video_url?: string;
  product_small_image_urls?: string[];
  shop_url?: string;
  shop_id?: string;
  second_level_category_id?: string;
  first_level_category_id?: string;
  original_price?: string;
  sale_price: string;
  discount?: string;
  sale_price_currency?: string;
  lastest_volume?: number;
  product_detail_url: string;
  platform_product_type?: string;
  evaluate_rate?: string;
  ship_to_days?: string;
  relevant_market_commission_rate?: string;
  target_sale_price?: string;
  target_sale_price_currency?: string;
  target_original_price?: string;
  target_original_price_currency?: string;
  promotion_link?: string;
}

export class AliExpressApiService {
  private config: AliExpressConfig;
  private baseUrl = 'https://api-sg.aliexpress.com/sync';

  constructor(config?: AliExpressConfig) {
    this.config = config || {
      appKey: process.env.ALIEXPRESS_APP_KEY || '',
      appSecret: process.env.ALIEXPRESS_APP_SECRET || '',
      trackingId: process.env.ALIEXPRESS_TRACKING_ID || '',
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
   * Faire un appel à l'API AliExpress
   */
  private async callApi(method: string, params: Record<string, any> = {}): Promise<any> {
    const timestamp = Date.now().toString();
    
    const requestParams: Record<string, any> = {
      app_key: this.config.appKey,
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

    console.log('[AliExpress API] Calling:', method);
    console.log('[AliExpress API] URL:', url.replace(this.config.appSecret, '***'));

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AliExpress API] HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      console.log('[AliExpress API] Response:', JSON.stringify(data, null, 2));

      // Vérifier les erreurs de l'API
      if (data.error_response) {
        console.error('[AliExpress API] API Error:', data.error_response);
        throw new Error(data.error_response.msg || 'Erreur API AliExpress');
      }

      return data;
    } catch (error) {
      console.error('[AliExpress API] Call failed:', error);
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
      console.error('[AliExpress API] Invalid URL:', url, error);
      return null;
    }
  }

  /**
   * Obtenir les détails d'un produit par son ID
   * Méthode: aliexpress.affiliate.productdetail.get
   */
  async getProductDetails(productId: string): Promise<AliExpressProduct | null> {
    try {
      const params: Record<string, any> = {
        product_ids: productId,
        fields: 'product_id,product_title,product_main_image_url,product_video_url,product_small_image_urls,shop_url,shop_id,second_level_category_id,first_level_category_id,original_price,sale_price,discount,sale_price_currency,lastest_volume,product_detail_url,platform_product_type,evaluate_rate,ship_to_days,relevant_market_commission_rate',
        target_currency: 'USD', // USD d'abord, conversion après
        target_language: 'FR',
        country: 'BJ', // Bénin
      };

      // Le tracking ID est OBLIGATOIRE pour l'API affiliate
      // Si pas de tracking ID, utiliser un tracking ID par défaut pour les tests
      if (this.config.trackingId) {
        params.tracking_id = this.config.trackingId;
      } else {
        // Tracking ID de test - l'utilisateur devra le remplacer pour gagner des commissions
        console.warn('[AliExpress API] ⚠️  Tracking ID non configuré, utilisation mode test');
        params.tracking_id = 'default';
      }

      const response = await this.callApi('aliexpress.affiliate.productdetail.get', params);

      if (response.aliexpress_affiliate_productdetail_get_response) {
        const result = response.aliexpress_affiliate_productdetail_get_response.resp_result;
        
        if (result && result.resp_code === 200 && result.result) {
          const products = result.result.products?.product || [];
          return products[0] || null;
        }
      }

      return null;
    } catch (error) {
      console.error('[AliExpress API] getProductDetails failed:', error);
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
   * Générer un lien d'affiliation pour un produit
   * Méthode: aliexpress.affiliate.link.generate
   */
  async generateAffiliateLink(productUrl: string): Promise<string> {
    try {
      if (!this.config.trackingId) {
        console.warn('[AliExpress API] Tracking ID non configuré, lien non affilié');
        return productUrl;
      }

      const params = {
        promotion_link_type: '0', // 0 = normal link
        source_values: productUrl,
        tracking_id: this.config.trackingId,
      };

      const response = await this.callApi('aliexpress.affiliate.link.generate', params);

      if (response.aliexpress_affiliate_link_generate_response) {
        const result = response.aliexpress_affiliate_link_generate_response.resp_result;
        
        if (result && result.resp_code === 200 && result.result) {
          const links = result.result.promotion_links?.promotion_link || [];
          return links[0]?.promotion_link || productUrl;
        }
      }

      return productUrl;
    } catch (error) {
      console.error('[AliExpress API] generateAffiliateLink failed:', error);
      return productUrl; // Retourner l'URL originale en cas d'erreur
    }
  }

  /**
   * Rechercher des produits
   * Méthode: aliexpress.affiliate.product.query
   */
  async searchProducts(keywords: string, pageNo: number = 1, pageSize: number = 20): Promise<AliExpressProduct[]> {
    try {
      const params: Record<string, any> = {
        keywords,
        page_no: pageNo.toString(),
        page_size: pageSize.toString(),
        fields: 'product_id,product_title,product_main_image_url,sale_price,original_price,discount,product_detail_url,evaluate_rate,lastest_volume',
        target_currency: 'XOF',
        target_language: 'FR',
        ship_to_country: 'BJ',
        sort: 'SALE_PRICE_ASC', // Trier par prix croissant
      };

      if (this.config.trackingId) {
        params.tracking_id = this.config.trackingId;
      }

      const response = await this.callApi('aliexpress.affiliate.product.query', params);

      if (response.aliexpress_affiliate_product_query_response) {
        const result = response.aliexpress_affiliate_product_query_response.resp_result;
        
        if (result && result.resp_code === 200 && result.result) {
          return result.result.products?.product || [];
        }
      }

      return [];
    } catch (error) {
      console.error('[AliExpress API] searchProducts failed:', error);
      return [];
    }
  }

  /**
   * Obtenir des produits recommandés (hot products)
   * Méthode: aliexpress.affiliate.hotproduct.query
   */
  async getHotProducts(categoryId?: string, pageNo: number = 1, pageSize: number = 20): Promise<AliExpressProduct[]> {
    try {
      const params: Record<string, any> = {
        page_no: pageNo.toString(),
        page_size: pageSize.toString(),
        fields: 'product_id,product_title,product_main_image_url,sale_price,original_price,discount,product_detail_url,evaluate_rate,lastest_volume',
        target_currency: 'XOF',
        target_language: 'FR',
        ship_to_country: 'BJ',
      };

      if (categoryId) {
        params.category_ids = categoryId;
      }

      if (this.config.trackingId) {
        params.tracking_id = this.config.trackingId;
      }

      const response = await this.callApi('aliexpress.affiliate.hotproduct.query', params);

      if (response.aliexpress_affiliate_hotproduct_query_response) {
        const result = response.aliexpress_affiliate_hotproduct_query_response.resp_result;
        
        if (result && result.resp_code === 200 && result.result) {
          return result.result.products?.product || [];
        }
      }

      return [];
    } catch (error) {
      console.error('[AliExpress API] getHotProducts failed:', error);
      return [];
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
      const smallImages = typeof product.product_small_image_urls === 'string'
        ? product.product_small_image_urls.split(',')
        : product.product_small_image_urls;
      images.push(...smallImages.slice(0, 4)); // Max 5 images au total
    }

    // Parser les prix (peuvent être au format "123.45 XOF" ou juste "123.45")
    const parsePrice = (priceStr: string | undefined): number => {
      if (!priceStr) return 0;
      const cleaned = priceStr.replace(/[^\d.]/g, '');
      const price = parseFloat(cleaned);
      return isNaN(price) ? 0 : Math.round(price * 100); // Convertir en centimes
    };

    const salePrice = parsePrice(product.sale_price || product.target_sale_price);
    const originalPrice = parsePrice(product.original_price || product.target_original_price);

    return {
      name: product.product_title.slice(0, 200), // Limiter à 200 caractères
      price: salePrice || 2500, // Prix par défaut: 2500 XOF (25 FCFA)
      original_price: originalPrice > salePrice ? originalPrice : Math.round(salePrice * 1.3),
      images: images.filter(img => img && img.startsWith('http')),
      description: `${product.product_title}\n\nProduit importé depuis AliExpress.\n\nCaractéristiques:\n- Note: ${product.evaluate_rate || 'N/A'}\n- Ventes récentes: ${product.lastest_volume || 0}\n- Catégorie: ${product.first_level_category_id || 'N/A'}`,
      short_description: product.product_title.slice(0, 150),
      sku: `AE-${product.product_id}`,
      stock_quantity: 100, // Stock par défaut pour drop shipping
      source_url: product.promotion_link || product.product_detail_url || sourceUrl,
      source_platform: 'aliexpress' as const,
      specifications: {
        'Product ID': product.product_id,
        'Évaluation': product.evaluate_rate || 'N/A',
        'Ventes': product.lastest_volume?.toString() || '0',
        'Commission': product.relevant_market_commission_rate || 'N/A',
        'Délai de livraison': product.ship_to_days || 'N/A',
      },
    };
  }
}

// Export singleton
let apiServiceInstance: AliExpressApiService | null = null;

export function getAliExpressApiService(): AliExpressApiService {
  if (!apiServiceInstance) {
    apiServiceInstance = new AliExpressApiService();
  }
  return apiServiceInstance;
}
