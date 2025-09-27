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

  private static readonly USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
  ];

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
   * Valider une URL de produit
   */
  static validateProductUrl(url: string): { valid: boolean; error?: string } {
    if (!url || typeof url !== 'string') {
      return { valid: false, error: 'URL invalide' };
    }

    try {
      const urlObj = new URL(url);
      
      // Vérifier que c'est HTTPS
      if (urlObj.protocol !== 'https:') {
        return { valid: false, error: 'L\'URL doit utiliser HTTPS' };
      }

      // Vérifier que c'est une plateforme supportée
      const platform = this.detectPlatform(url);
      if (!platform) {
        return { valid: false, error: 'Plateforme non supportée. Seuls AliExpress et AliBaba sont supportés.' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Format d\'URL invalide' };
    }
  }

  /**
   * Scraper un produit depuis une URL avec fallback intelligent
   */
  static async scrapeProduct(url: string): Promise<ScrapedProductData | null> {
    const platform = this.detectPlatform(url);
    
    if (!platform) {
      throw new Error('Plateforme non supportée. Seuls AliExpress et AliBaba sont supportés.');
    }

    console.log(`[SCRAPING] 🕷️ Début du scraping pour: ${url}`);

    // Utiliser Puppeteer directement (plus fiable pour les sites modernes)
    try {
      console.log('[SCRAPING] 🔄 Tentative avec Puppeteer...');
      const result = await this.scrapeWithPuppeteer(url, platform);
      if (result) {
        console.log('[SCRAPING] ✅ Succès avec Puppeteer');
        return result;
      }
    } catch (error) {
      console.log('[SCRAPING] ❌ Puppeteer échoué:', error);
    }

    console.log('[SCRAPING] ❌ Toutes les méthodes ont échoué');
    throw new Error('Impossible de scraper ce produit. Veuillez vérifier l\'URL ou réessayer plus tard.');
  }


  /**
   * Scraper avec Puppeteer (fallback pour les sites avec JavaScript)
   */
  private static async scrapeWithPuppeteer(url: string, platform: keyof typeof ScrapingService.SUPPORTED_PLATFORMS): Promise<ScrapedProductData | null> {
    let browser: any = null;
    
    try {
      const puppeteer = (await import('puppeteer')).default;
      
      console.log('[SCRAPING] 🤖 Lancement de Puppeteer...');
      
      // Configuration anti-détection et production
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-blink-features=AutomationControlled',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-images', // Désactiver les images pour aller plus vite
          '--memory-pressure-off',
          '--max_old_space_size=4096'
        ],
        timeout: 30000, // 30 secondes timeout
        protocolTimeout: 30000
      });

      const page = await browser.newPage();
      
      // Rotation d'user-agent
      const userAgent = this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)];
      await page.setUserAgent(userAgent);
      
      // Configuration de la page
      await page.setViewport({ width: 1366, height: 768 });
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      });

      // Masquer les signes d'automatisation
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
      });

      console.log('[SCRAPING] 📄 Navigation vers la page...');
      
      // Navigation avec timeout
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      // Attendre que le contenu se charge
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

      console.log('[SCRAPING] 🔍 Extraction des données...');

      // Extraire les données
      const productData = await page.evaluate((platform: string) => {
        const selectors = {
          aliexpress: {
            name: ['.product-title-text', 'h1', '.pdp-product-name', '.product-title'],
            price: ['.price-current', '.price .notranslate', '[data-pl="price"]', '.price-current-single'],
            images: ['.images-view-item img', '.gallery-image img', '.product-image img', '.detail-gallery img'],
            description: ['.product-detail-description', '.product-description', '.detail-desc']
          },
          alibaba: {
            name: ['.product-title', 'h1', '.product-name', '.title'],
            price: ['.price', '.price-current', '.price-value', '.price-text'],
            images: ['.product-image img', '.gallery img', '.detail-image img'],
            description: ['.product-description', '.detail-description', '.description']
          }
        };

        const platformSelectors = selectors[platform as keyof typeof selectors] || selectors.aliexpress;

        // Extraction du nom
        let name = '';
        for (const selector of platformSelectors.name) {
          const element = document.querySelector(selector);
          if (element && element.textContent?.trim()) {
            name = element.textContent.trim();
            break;
          }
        }

        // Extraction du prix
        let priceText = '';
        for (const selector of platformSelectors.price) {
          const element = document.querySelector(selector);
          if (element && element.textContent?.trim()) {
            priceText = element.textContent.trim();
            break;
          }
        }

        // Extraction des images
        const images: string[] = [];
        for (const selector of platformSelectors.images) {
          const elements = document.querySelectorAll(selector);
          elements.forEach((img: any) => {
            const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy');
            if (src && src.startsWith('http') && !images.includes(src)) {
              images.push(src);
            }
          });
          if (images.length >= 5) break;
        }

        // Extraction de la description
        let description = '';
        for (const selector of platformSelectors.description) {
          const element = document.querySelector(selector);
          if (element && element.textContent?.trim()) {
            description = element.textContent.trim();
            break;
          }
        }

        return {
          name: name || 'Produit sans nom',
          price: priceText || '0',
          images: images,
          description: description || 'Description non disponible'
        };
      }, platform);

      // Traitement des données
      const priceValue = this.parsePrice(productData.price);
      const finalPrice = priceValue > 0 ? Math.round(priceValue * 100) : this.getDefaultPrice(platform);

      console.log(`[SCRAPING] 📊 Données extraites: ${productData.name.substring(0, 50)}... - ${finalPrice/100}€ - ${productData.images.length} images`);

      const result = {
        name: productData.name,
        price: finalPrice,
        original_price: Math.round(finalPrice * 1.2),
        images: productData.images.slice(0, 5),
        description: productData.description,
        short_description: productData.description.substring(0, 150) + (productData.description.length > 150 ? '...' : ''),
        sku: `SCRAPED-${Date.now()}`,
        specifications: {
          'Source': 'Scraping Puppeteer',
          'Importé le': new Date().toLocaleDateString('fr-FR'),
          'Plateforme': this.SUPPORTED_PLATFORMS[platform].name,
          'URL originale': url
        },
        source_platform: platform,
        source_url: url
      };

      // Cleanup - fermer le navigateur
      await browser.close();
      
      return result;

    } catch (error) {
      console.error('[SCRAPING] Erreur Puppeteer:', error);
      
      // Cleanup en cas d'erreur
      try {
        if (browser) {
          await browser.close();
        }
      } catch (cleanupError) {
        console.error('[SCRAPING] Erreur lors du cleanup:', cleanupError);
      }
      
      throw error;
    }
  }

  /**
   * Obtenir les sélecteurs CSS pour chaque plateforme
   */
  private static getSelectors(platform: keyof typeof ScrapingService.SUPPORTED_PLATFORMS) {
    const selectors = {
      aliexpress: {
        name: ['.product-title-text', 'h1', '.pdp-product-name', '.product-title', '.product-name'],
        price: ['.price-current', '.price .notranslate', '[data-pl="price"]', '.price-current-single', '.price-value'],
        images: ['.images-view-item img', '.gallery-image img', '.product-image img', '.detail-gallery img', '.gallery img'],
        description: ['.product-detail-description', '.product-description', '.detail-desc', '.product-detail']
      },
      alibaba: {
        name: ['.product-title', 'h1', '.product-name', '.title', '.product-title-text'],
        price: ['.price', '.price-current', '.price-value', '.price-text', '.price-current-single'],
        images: ['.product-image img', '.gallery img', '.detail-image img', '.product-gallery img'],
        description: ['.product-description', '.detail-description', '.description', '.product-detail']
      }
    };

    return selectors[platform] || selectors.aliexpress;
  }

  /**
   * Parser le prix depuis le texte
   */
  private static parsePrice(priceText: string): number {
    if (!priceText) return 0;
    
    // Nettoyer le texte du prix
    const cleanPrice = priceText
      .replace(/[^\d.,]/g, '') // Garder seulement chiffres, points et virgules
      .replace(',', '.') // Remplacer virgule par point
      .replace(/\.(?=.*\.)/g, ''); // Supprimer les points sauf le dernier (pour les milliers)
    
    const price = parseFloat(cleanPrice);
    return isNaN(price) ? 0 : price;
  }

  /**
   * Obtenir un prix par défaut selon la plateforme
   */
  private static getDefaultPrice(platform: keyof typeof ScrapingService.SUPPORTED_PLATFORMS): number {
    return platform === 'aliexpress' ? 2500 : 1500; // 25€ pour AliExpress, 15€ pour AliBaba
  }
}