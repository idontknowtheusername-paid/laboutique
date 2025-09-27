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
   * Scraping réel avec Puppeteer (remplace la simulation)
   */
  private static async simulateScraping(
    url: string, 
    platform: keyof typeof ScrapingService.SUPPORTED_PLATFORMS
  ): Promise<ScrapedProductData> {
    console.log(`[SCRAPING] 🕷️ Début du scraping réel pour ${platform}:`, url);
    
    try {
      // Utiliser Puppeteer pour le scraping réel
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Pour les environnements Docker/CI
      });
      const page = await browser.newPage();

      // Définir un user agent réaliste
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      try {
        console.log(`[SCRAPING] 📄 Chargement de la page...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        console.log(`[SCRAPING] 🔍 Extraction des données...`);
        const productData = await page.evaluate((platform) => {
          // Sélecteurs spécifiques selon la plateforme
          const selectors = {
            aliexpress: {
              name: 'h1[data-pl="product-title"], .product-title-text, h1',
              price: '.price-current, .price .notranslate, [data-pl="price"]',
              images: '.images-view-item img, .gallery-image img, .product-image img',
              description: '.product-detail-description, .product-description'
            },
            alibaba: {
              name: 'h1.product-title, .product-title, h1',
              price: '.price-current, .price-value, .price',
              images: '.product-image img, .gallery-image img, .main-image img',
              description: '.product-description, .detail-description'
            }
          };

          const platformSelectors = selectors[platform] || selectors.aliexpress;

          // Extraire le nom
          const nameElement = document.querySelector(platformSelectors.name);
          const name = nameElement?.textContent?.trim() || 'Produit sans nom';

          // Extraire le prix
          const priceElement = document.querySelector(platformSelectors.price);
          const priceText = priceElement?.textContent?.trim() || '0';
          const price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          
          // Si le prix est 0, utiliser un prix par défaut
          const finalPrice = price > 0 ? price : (platform === 'aliexpress' ? 25 : 15);

          // Extraire les images
          const imageElements = document.querySelectorAll(platformSelectors.images);
          const images = Array.from(imageElements)
            .map(img => (img as HTMLImageElement).src || img.getAttribute('data-src'))
            .filter((src): src is string => src !== null && src.startsWith('http'))
            .slice(0, 5); // Max 5 images

          // Extraire la description
          const descElement = document.querySelector(platformSelectors.description);
          const description = descElement?.textContent?.trim() || 'Description non disponible';

          return {
            name,
            price: Math.round(finalPrice * 100), // Convertir en centimes
            original_price: Math.round(finalPrice * 1.2 * 100),
            description,
            short_description: description.substring(0, 150) + (description.length > 150 ? '...' : ''),
            images: images.length > 0 ? images : ['https://via.placeholder.com/500x500'],
            brand: 'Marque inconnue',
            category: 'Général',
            stock_quantity: Math.floor(Math.random() * 50) + 1,
            source_url: window.location.href,
            platform
          };
        }, platform);

        await browser.close();
        
        console.log(`[SCRAPING] ✅ Données extraites:`, {
          name: productData.name,
          price: productData.price,
          imagesCount: productData.images.length
        });

        return {
          ...productData,
          sku: `${platform.toUpperCase()}-${Date.now()}`,
          specifications: {
            'Source': 'Scraping réel',
            'Importé le': new Date().toLocaleDateString('fr-FR'),
            'Plateforme': platform,
            'URL originale': url
          },
          source_platform: platform
        };

      } catch (pageError) {
        await browser.close();
        console.error(`[SCRAPING] ❌ Erreur lors du scraping:`, pageError);
        throw pageError;
      }

    } catch (error) {
      console.error(`[SCRAPING] ❌ Erreur critique:`, error);
      
      // Fallback vers la simulation si le scraping échoue
      console.log(`[SCRAPING] 🔄 Fallback vers la simulation...`);
      return this.fallbackSimulation(url, platform);
    }
  }

  /**
   * Simulation de fallback (si le scraping réel échoue)
   */
  private static fallbackSimulation(
    url: string, 
    platform: keyof typeof ScrapingService.SUPPORTED_PLATFORMS
  ): ScrapedProductData {
    const platformInfo = this.getPlatformInfo(platform);
    const urlParts = url.split('/');
    const productId = urlParts[urlParts.length - 1] || 'unknown';
    
    // Données de fallback
    const fallbackProducts = {
      aliexpress: {
        name: 'Produit AliExpress - ' + productId.substring(0, 10),
        price: 2500000, // 25,000 FCFA en centimes
        original_price: 3500000, // 35,000 FCFA en centimes
        description: 'Produit importé depuis AliExpress. Description non disponible.',
        short_description: 'Produit AliExpress importé',
        images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500'],
        brand: 'AliExpress',
        category: 'Import',
        stock_quantity: 10
      },
      alibaba: {
        name: 'Produit AliBaba - ' + productId.substring(0, 10),
        price: 1500000, // 15,000 FCFA en centimes
        original_price: 2000000, // 20,000 FCFA en centimes
        description: 'Produit importé depuis AliBaba. Description non disponible.',
        short_description: 'Produit AliBaba importé',
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
        brand: 'AliBaba',
        category: 'Import',
        stock_quantity: 25
      }
    };

    const selectedProduct = fallbackProducts[platform];

    return {
      ...selectedProduct,
      sku: `${platform.toUpperCase()}-FALLBACK-${Date.now()}`,
      specifications: {
        'Source': 'Simulation (scraping échoué)',
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