import { ScrapedProductData } from './types';

export class ScrapingService {
  private static readonly SUPPORTED_PLATFORMS = {
    aliexpress: {
      domain: 'aliexpress.com',
      name: 'AliExpress',
      icon: '🛒',
      color: 'bg-orange-100 text-orange-800'
    },
    alibaba: {
      domain: 'alibaba.com',
      name: 'AliBaba',
      icon: '🏭',
      color: 'bg-blue-100 text-blue-800'
    }
  };

  /**
   * Détecter la plateforme à partir de l'URL
   */
  static detectPlatform(url: string): keyof typeof ScrapingService.SUPPORTED_PLATFORMS | null {
    for (const [platform, config] of Object.entries(this.SUPPORTED_PLATFORMS)) {
      if (url.includes(config.domain)) {
        return platform as keyof typeof ScrapingService.SUPPORTED_PLATFORMS;
      }
    }
    return null;
  }

  /**
   * Obtenir les informations de la plateforme
   */
  static getPlatformInfo(platform: string) {
    return this.SUPPORTED_PLATFORMS[platform as keyof typeof ScrapingService.SUPPORTED_PLATFORMS] || null;
  }

  /**
   * Scraper un produit depuis une URL
   */
  static async scrapeProduct(url: string): Promise<ScrapedProductData | null> {
    const platform = this.detectPlatform(url);
    
    if (!platform) {
      throw new Error('Plateforme non supportée. Seuls AliExpress et AliBaba sont supportés.');
    }

    try {
      // En production, utilisez une vraie API de scraping comme ScraperAPI, Bright Data, etc.
      // Pour la démo, on simule des données réalistes
      const productData = await this.simulateScraping(url, platform);
      
      return productData;
    } catch (error) {
      console.error(`Error scraping ${platform}:`, error);
      throw new Error(`Impossible de récupérer les données du produit depuis ${this.getPlatformInfo(platform)?.name}`);
    }
  }

  /**
   * Simulation de scraping (à remplacer par une vraie API en production)
   */
  private static async simulateScraping(
    url: string, 
    platform: keyof typeof ScrapingService.SUPPORTED_PLATFORMS
  ): Promise<ScrapedProductData> {
    // Simuler un délai de scraping
    await new Promise(resolve => setTimeout(resolve, 2000));

    const platformInfo = this.getPlatformInfo(platform);
    
    // Générer des données réalistes basées sur l'URL
    const urlParts = url.split('/');
    const productId = urlParts[urlParts.length - 1] || 'unknown';
    
    // Données simulées réalistes
    const sampleProducts = {
      aliexpress: [
        {
          name: 'iPhone 15 Pro Max 256GB - Smartphone Apple',
          price: 450000, // FCFA
          original_price: 550000,
          description: 'iPhone 15 Pro Max 256GB en excellent état. Écran 6.7 pouces Super Retina XDR, processeur A17 Pro, triple caméra 48MP. Livré avec chargeur et câble.',
          short_description: 'iPhone 15 Pro Max 256GB - Smartphone Apple haut de gamme avec triple caméra 48MP',
          images: [
            'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500',
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
            'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500'
          ],
          brand: 'Apple',
          category: 'Smartphones',
          stock_quantity: 15
        },
        {
          name: 'Samsung Galaxy S24 Ultra 512GB - Smartphone Android',
          price: 380000,
          original_price: 450000,
          description: 'Samsung Galaxy S24 Ultra 512GB avec S Pen. Écran 6.8 pouces Dynamic AMOLED 2X, processeur Snapdragon 8 Gen 3, caméra 200MP.',
          short_description: 'Samsung Galaxy S24 Ultra 512GB avec S Pen et caméra 200MP',
          images: [
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
            'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500'
          ],
          brand: 'Samsung',
          category: 'Smartphones',
          stock_quantity: 8
        }
      ],
      alibaba: [
        {
          name: 'Lot de 100 T-shirts Coton Bio - Blanc',
          price: 15000,
          original_price: 20000,
          description: 'Lot de 100 T-shirts en coton bio de qualité supérieure. Taille unique, couleur blanche. Idéal pour la personnalisation ou la revente.',
          short_description: 'Lot de 100 T-shirts coton bio blanc - Qualité supérieure',
          images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
            'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500'
          ],
          brand: 'Coton Bio',
          category: 'Textile',
          stock_quantity: 50
        },
        {
          name: 'Coffret Maquillage Professionnel - 24 Couleurs',
          price: 25000,
          original_price: 35000,
          description: 'Coffret de maquillage professionnel avec 24 couleurs de fard à paupières. Palette complète pour tous les looks. Qualité professionnelle.',
          short_description: 'Coffret maquillage professionnel 24 couleurs - Palette complète',
          images: [
            'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500',
            'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500'
          ],
          brand: 'Beauty Pro',
          category: 'Cosmétiques',
          stock_quantity: 25
        }
      ]
    };

    // Sélectionner un produit aléatoire basé sur l'ID
    const products = sampleProducts[platform];
    const selectedProduct = products[Math.abs(productId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % products.length];

    return {
      ...selectedProduct,
      sku: `${platform.toUpperCase()}-${Date.now()}`,
      specifications: {
        'Source': platformInfo?.name || platform,
        'Importé le': new Date().toLocaleDateString('fr-FR'),
        'Plateforme': platformInfo?.name || platform,
        'URL originale': url
      },
      source_url: url,
      source_platform: platform
    };
  }

  /**
   * Valider une URL de produit
   */
  static validateProductUrl(url: string): { valid: boolean; error?: string } {
    try {
      const urlObj = new URL(url);
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { valid: false, error: 'L\'URL doit commencer par http:// ou https://' };
      }

      const platform = this.detectPlatform(url);
      if (!platform) {
        return { 
          valid: false, 
          error: 'Plateforme non supportée. Seuls AliExpress et AliBaba sont supportés.' 
        };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'URL invalide' };
    }
  }

  /**
   * Obtenir la liste des plateformes supportées
   */
  static getSupportedPlatforms() {
    return Object.entries(this.SUPPORTED_PLATFORMS).map(([key, config]) => ({
      key,
      ...config
    }));
  }
}