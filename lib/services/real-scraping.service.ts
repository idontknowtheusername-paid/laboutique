import { ScrapedProductData } from './types';

export class RealScrapingService {
  private static readonly SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
  private static readonly BRIGHT_DATA_USERNAME = process.env.BRIGHT_DATA_USERNAME;
  private static readonly BRIGHT_DATA_PASSWORD = process.env.BRIGHT_DATA_PASSWORD;

  /**
   * Scraper un produit depuis une URL avec une vraie API
   */
  static async scrapeProduct(url: string): Promise<ScrapedProductData | null> {
    try {
      // Option 1: ScraperAPI (recommandé)
      if (this.SCRAPER_API_KEY) {
        return await this.scrapeWithScraperAPI(url);
      }

      // Option 2: Bright Data
      if (this.BRIGHT_DATA_USERNAME && this.BRIGHT_DATA_PASSWORD) {
        return await this.scrapeWithBrightData(url);
      }

      // Option 3: Puppeteer (plus lent mais gratuit)
      return await this.scrapeWithPuppeteer(url);

    } catch (error) {
      console.error('Erreur lors du scraping:', error);
      throw new Error('Impossible de récupérer les données du produit');
    }
  }

  /**
   * Scraping avec ScraperAPI (recommandé)
   */
  private static async scrapeWithScraperAPI(url: string): Promise<ScrapedProductData> {
    const response = await fetch(`http://api.scraperapi.com?api_key=${this.SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error(`ScraperAPI error: ${response.status}`);
    }

    const html = await response.text();
    return this.parseProductData(html, url);
  }

  /**
   * Scraping avec Bright Data
   */
  private static async scrapeWithBrightData(url: string): Promise<ScrapedProductData> {
    const proxyUrl = `http://${this.BRIGHT_DATA_USERNAME}:${this.BRIGHT_DATA_PASSWORD}@brd.superproxy.io:22225`;
    
    const response = await fetch(url, {
      headers: {
        'Proxy-Authorization': `Basic ${Buffer.from(`${this.BRIGHT_DATA_USERNAME}:${this.BRIGHT_DATA_PASSWORD}`).toString('base64')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Bright Data error: ${response.status}`);
    }

    const html = await response.text();
    return this.parseProductData(html, url);
  }

  /**
   * Scraping avec Puppeteer (gratuit mais plus lent)
   */
  private static async scrapeWithPuppeteer(url: string): Promise<ScrapedProductData> {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      const productData = await page.evaluate(() => {
        // Sélecteurs pour AliExpress
        const name = document.querySelector('h1[data-pl="product-title"]')?.textContent?.trim() ||
                    document.querySelector('.product-title-text')?.textContent?.trim() ||
                    document.querySelector('h1')?.textContent?.trim();

        const price = document.querySelector('.price-current')?.textContent?.trim() ||
                     document.querySelector('.price .notranslate')?.textContent?.trim() ||
                     document.querySelector('[data-pl="price"]')?.textContent?.trim();

        const images = Array.from(document.querySelectorAll('.images-view-item img, .gallery-image img'))
          .map(img => (img as HTMLImageElement).src || img.getAttribute('data-src'))
          .filter(src => src && src.startsWith('http'));

        const description = document.querySelector('.product-detail-description')?.textContent?.trim() ||
                           document.querySelector('.product-description')?.textContent?.trim();

        return {
          name: name || 'Produit sans nom',
          price: price || '0',
          images: images.slice(0, 5), // Max 5 images
          description: description || '',
          source_url: window.location.href
        };
      });

      await browser.close();
      return this.formatProductData(productData, url);

    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  /**
   * Parser les données HTML
   */
  private static parseProductData(html: string, url: string): ScrapedProductData {
    // Ici vous pouvez utiliser cheerio ou d'autres parseurs HTML
    // Pour l'instant, on retourne des données de base
    return {
      name: 'Produit scrapé',
      price: 10000,
      original_price: 15000,
      description: 'Description scrapée depuis la page',
      short_description: 'Description courte',
      images: ['https://via.placeholder.com/500x500'],
      brand: 'Marque inconnue',
      category: 'Général',
      stock_quantity: 1,
      sku: `SCRAPED-${Date.now()}`,
      specifications: {},
      source_url: url,
      source_platform: url.includes('aliexpress') ? 'aliexpress' : 'alibaba'
    };
  }

  /**
   * Formater les données du produit
   */
  private static formatProductData(data: any, url: string): ScrapedProductData {
    // Nettoyer et formater les données
    const cleanPrice = (price: string) => {
      const numericPrice = price.replace(/[^\d.,]/g, '').replace(',', '.');
      return Math.round(parseFloat(numericPrice) * 100); // Convertir en centimes
    };

    return {
      name: data.name || 'Produit sans nom',
      price: cleanPrice(data.price || '0'),
      original_price: cleanPrice(data.price || '0') * 1.2,
      description: data.description || 'Description non disponible',
      short_description: (data.description || '').substring(0, 100) + '...',
      images: data.images || ['https://via.placeholder.com/500x500'],
      brand: 'Marque inconnue',
      category: 'Général',
      stock_quantity: Math.floor(Math.random() * 50) + 1,
      sku: `SCRAPED-${Date.now()}`,
      specifications: {
        'Source': 'Scraping réel',
        'Importé le': new Date().toLocaleDateString('fr-FR'),
        'URL originale': url
      },
      source_url: url,
      source_platform: url.includes('aliexpress') ? 'aliexpress' : 'alibaba'
    };
  }
}