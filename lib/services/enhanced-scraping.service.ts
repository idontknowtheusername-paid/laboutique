import { ScrapedProductData } from './types';

export class EnhancedScrapingService {
  private static readonly USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0'
  ];

  private static readonly PROXIES = [
    // Proxies gratuits (à remplacer par des proxies fonctionnels)
    'http://proxy1.example.com:8080',
    'http://proxy2.example.com:8080',
    'http://proxy3.example.com:8080'
  ];

  /**
   * Scraper avec Puppeteer amélioré
   */
  static async scrapeWithPuppeteer(url: string): Promise<ScrapedProductData | null> {
    try {
      const puppeteer = await import('puppeteer');
      
      // Configuration anti-détection
      const browser = await puppeteer.launch({
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
          '--disable-features=VizDisplayCompositor'
        ]
      });

      const page = await browser.newPage();
      
      // Rotation d'user-agent
      const userAgent = this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)];
      await page.setUserAgent(userAgent);
      
      // Délais aléatoires pour éviter la détection
      await page.setViewport({ width: 1366, height: 768 });
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      });

      // Navigation avec timeout
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      // Attendre que le contenu se charge
      await page.waitForTimeout(2000 + Math.random() * 3000);

      // Extraire les données
      const productData = await page.evaluate(() => {
        // Sélecteurs pour AliExpress
        const name = document.querySelector('.product-title-text')?.textContent?.trim() ||
                    document.querySelector('h1')?.textContent?.trim() ||
                    document.querySelector('.pdp-product-name')?.textContent?.trim();

        const price = document.querySelector('.price-current')?.textContent?.trim() ||
                     document.querySelector('.price .notranslate')?.textContent?.trim() ||
                     document.querySelector('[data-pl="price"]')?.textContent?.trim() ||
                     document.querySelector('.price-current-single')?.textContent?.trim();

        const images = Array.from(document.querySelectorAll('.images-view-item img, .gallery-image img, .product-image img'))
          .map(img => (img as HTMLImageElement).src || img.getAttribute('data-src'))
          .filter((src): src is string => src !== null && src.startsWith('http'))
          .slice(0, 5);

        const description = document.querySelector('.product-detail-description')?.textContent?.trim() ||
                           document.querySelector('.product-description')?.textContent?.trim() ||
                           document.querySelector('.detail-desc')?.textContent?.trim();

        return {
          name: name || 'Produit sans nom',
          price: price || '0',
          images: images,
          description: description || 'Description non disponible'
        };
      });

      await browser.close();

      // Traitement des données
      const price = parseFloat(productData.price.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      const finalPrice = price > 0 ? Math.round(price * 100) : 2500; // 25€ par défaut

      return {
        name: productData.name,
        price: finalPrice,
        original_price: Math.round(finalPrice * 1.2),
        images: productData.images,
        description: productData.description,
        sku: `SCRAPED-${Date.now()}`,
        specifications: {
          'Source': 'Scraping automatique',
          'Importé le': new Date().toLocaleDateString('fr-FR'),
          'Plateforme': url.includes('aliexpress') ? 'AliExpress' : 'AliBaba',
          'URL originale': url
        },
        source_platform: url.includes('aliexpress') ? 'aliexpress' : 'alibaba',
        source_url: url
      };

    } catch (error) {
      console.error('Erreur scraping Puppeteer:', error);
      return null;
    }
  }

  /**
   * Scraper avec Cheerio (plus léger)
   */
  static async scrapeWithCheerio(url: string): Promise<ScrapedProductData | null> {
    try {
      const axios = await import('axios');
      const cheerio = await import('cheerio');

      // Rotation d'user-agent
      const userAgent = this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)];
      
      const response = await axios.default.get(url, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);

      // Extraction des données
      const name = $('.product-title-text, h1, .pdp-product-name').first().text().trim();
      const price = $('.price-current, .price .notranslate, [data-pl="price"]').first().text().trim();
      
      const images: string[] = [];
      $('.images-view-item img, .gallery-image img, .product-image img').each((_, img) => {
        const src = $(img).attr('src') || $(img).attr('data-src');
        if (src && src.startsWith('http')) {
          images.push(src);
        }
      });

      const description = $('.product-detail-description, .product-description, .detail-desc').first().text().trim();

      if (!name) {
        throw new Error('Impossible d\'extraire le nom du produit');
      }

      const priceValue = parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      const finalPrice = priceValue > 0 ? Math.round(priceValue * 100) : 2500;

      return {
        name,
        price: finalPrice,
        original_price: Math.round(finalPrice * 1.2),
        images: images.slice(0, 5),
        description: description || 'Description non disponible',
        sku: `SCRAPED-${Date.now()}`,
        specifications: {
          'Source': 'Scraping Cheerio',
          'Importé le': new Date().toLocaleDateString('fr-FR'),
          'Plateforme': url.includes('aliexpress') ? 'AliExpress' : 'AliBaba',
          'URL originale': url
        },
        source_platform: url.includes('aliexpress') ? 'aliexpress' : 'alibaba',
        source_url: url
      };

    } catch (error) {
      console.error('Erreur scraping Cheerio:', error);
      return null;
    }
  }

  /**
   * Scraper avec API gratuite (ScrapingBee, ScraperAPI, etc.)
   */
  static async scrapeWithFreeAPI(url: string): Promise<ScrapedProductData | null> {
    try {
      // Exemple avec ScrapingBee (1000 requêtes gratuites/mois)
      const apiKey = process.env.SCRAPINGBEE_API_KEY; // À configurer
      
      if (!apiKey) {
        throw new Error('Clé API ScrapingBee non configurée');
      }

      const axios = await import('axios');
      const cheerio = await import('cheerio');

      const response = await axios.default.get('https://app.scrapingbee.com/api/v1/', {
        params: {
          api_key: apiKey,
          url: url,
          render_js: 'true',
          premium_proxy: 'true',
          country_code: 'fr'
        },
        timeout: 30000
      });

      const $ = cheerio.load(response.data);

      // Même logique d'extraction que Cheerio
      const name = $('.product-title-text, h1, .pdp-product-name').first().text().trim();
      const price = $('.price-current, .price .notranslate, [data-pl="price"]').first().text().trim();
      
      const images: string[] = [];
      $('.images-view-item img, .gallery-image img, .product-image img').each((_, img) => {
        const src = $(img).attr('src') || $(img).attr('data-src');
        if (src && src.startsWith('http')) {
          images.push(src);
        }
      });

      const description = $('.product-detail-description, .product-description, .detail-desc').first().text().trim();

      if (!name) {
        throw new Error('Impossible d\'extraire le nom du produit');
      }

      const priceValue = parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      const finalPrice = priceValue > 0 ? Math.round(priceValue * 100) : 2500;

      return {
        name,
        price: finalPrice,
        original_price: Math.round(finalPrice * 1.2),
        images: images.slice(0, 5),
        description: description || 'Description non disponible',
        sku: `SCRAPED-${Date.now()}`,
        specifications: {
          'Source': 'API ScrapingBee',
          'Importé le': new Date().toLocaleDateString('fr-FR'),
          'Plateforme': url.includes('aliexpress') ? 'AliExpress' : 'AliBaba',
          'URL originale': url
        },
        source_platform: url.includes('aliexpress') ? 'aliexpress' : 'alibaba',
        source_url: url
      };

    } catch (error) {
      console.error('Erreur scraping API:', error);
      return null;
    }
  }

  /**
   * Scraper avec fallback (essaye plusieurs méthodes)
   */
  static async scrapeProduct(url: string): Promise<ScrapedProductData | null> {
    console.log(`[SCRAPING] 🕷️ Début du scraping pour: ${url}`);

    // Essayer d'abord Cheerio (plus rapide)
    try {
      console.log('[SCRAPING] 🔄 Tentative avec Cheerio...');
      const result = await this.scrapeWithCheerio(url);
      if (result) {
        console.log('[SCRAPING] ✅ Succès avec Cheerio');
        return result;
      }
    } catch (error) {
      console.log('[SCRAPING] ❌ Cheerio échoué:', error);
    }

    // Fallback vers Puppeteer
    try {
      console.log('[SCRAPING] 🔄 Tentative avec Puppeteer...');
      const result = await this.scrapeWithPuppeteer(url);
      if (result) {
        console.log('[SCRAPING] ✅ Succès avec Puppeteer');
        return result;
      }
    } catch (error) {
      console.log('[SCRAPING] ❌ Puppeteer échoué:', error);
    }

    // Fallback vers API gratuite si configurée
    try {
      console.log('[SCRAPING] 🔄 Tentative avec API gratuite...');
      const result = await this.scrapeWithFreeAPI(url);
      if (result) {
        console.log('[SCRAPING] ✅ Succès avec API gratuite');
        return result;
      }
    } catch (error) {
      console.log('[SCRAPING] ❌ API gratuite échoué:', error);
    }

    console.log('[SCRAPING] ❌ Toutes les méthodes ont échoué');
    return null;
  }
}