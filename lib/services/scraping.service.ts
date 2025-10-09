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
      color: 'bg-blue-200 text-blue-900'
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
   * Scraper un produit via l'API ScrapingBee (exclusif)
   */
  static async scrapeProduct(url: string): Promise<ScrapedProductData | null> {
    const platform = this.detectPlatform(url);
    if (!platform) {
      throw new Error('Plateforme non supportée. Seuls AliExpress et AliBaba sont supportés.');
    }

    const apiKey = process.env.SCRAPINGBEE_API_KEY;
    if (!apiKey) {
      throw new Error('SCRAPINGBEE_API_KEY manquant. Configurez la clé API pour activer l\'import.');
    }

    // Robust call: JS rendering, premium proxy, geo US, small wait and retries
    const maxAttempts = 4;
    let attempt = 0;
    let lastStatus = 0;
    let html = '';
    while (attempt < maxAttempts) {
      attempt += 1;
      const apiUrl = new URL('https://app.scrapingbee.com/api/v1/');
      apiUrl.searchParams.set('api_key', apiKey);
      apiUrl.searchParams.set('url', url);
      apiUrl.searchParams.set('render_js', 'true');
      apiUrl.searchParams.set('premium_proxy', 'true');
      apiUrl.searchParams.set('country_code', 'US');
      apiUrl.searchParams.set('block_resources', 'true');
      apiUrl.searchParams.set('wait', '2500');

      const res = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: { 'Accept': 'text/html' },
        cache: 'no-store'
      } as any);

      lastStatus = res.status;
      if (res.ok) {
        html = await res.text();
        break;
      }
      if (res.status === 429 || res.status >= 500) {
        // exponential backoff
        const backoff = 400 * Math.pow(2, attempt - 1);
        await new Promise(r => setTimeout(r, backoff));
        continue;
      }
      const text = await res.text().catch(() => '');
      throw new Error(`ScrapingBee a retourné ${res.status}. Détails: ${text?.slice(0, 200)}`);
    }

    if (!html) {
      throw new Error(`ScrapingBee a retourné ${lastStatus}. Détails: (après ${maxAttempts} tentatives)`);
    }
    const { name, price, images, description } = this.parseHtml(html);

    const priceValue = this.parsePrice(price);
    const finalPrice = priceValue > 0 ? Math.round(priceValue * 100) : this.getDefaultPrice(platform);

    // Normaliser/rogner le nom selon la contrainte (<= 200)
    const normalizedName = (name || '').trim().replace(/\s+/g, ' ');
    const finalName = (normalizedName || 'Produit importé').slice(0, 200);

    return {
      name: finalName,
      price: finalPrice,
      original_price: Math.round(finalPrice * 1.2),
      images: images.slice(0, 5),
      description: description || 'Description non disponible',
      short_description: (description || '').substring(0, 150) + ((description || '').length > 150 ? '...' : ''),
      sku: `SCRAPED-${Date.now()}`,
      specifications: {
        'Source': 'ScrapingBee',
        'Importé le': new Date().toLocaleDateString('fr-FR'),
        'Plateforme': this.SUPPORTED_PLATFORMS[platform].name,
        'URL originale': url
      },
      source_platform: platform,
      source_url: url
    };
  }


  /**
   * Scraper avec Puppeteer (fallback pour les sites avec JavaScript)
   */
  // SUPPRIMÉ: Implémentation Puppeteer remplacée par ScrapingBee

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
   * Parsing HTML minimal (titre, prix, images, description)
   */
  private static parseHtml(html: string): { name: string; price: string; images: string[]; description: string } {
    const getMeta = (prop: string) => {
      const re = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
      const m = html.match(re); return m ? m[1] : '';
    };
    const getTitle = () => {
      const m = html.match(/<title[^>]*>([^<]+)<\/title>/i); return m ? m[1].trim() : '';
    };
    let name = getMeta('og:title') || getTitle();

    // Price via JSON-LD or meta tags
    let price = '';
    const jsonLdMatch = html.match(/\"price\"\s*:\s*\"?([0-9.,]+)\"?/i);
    if (jsonLdMatch) price = jsonLdMatch[1];
    if (!price) {
      const metaPrice = html.match(/<meta[^>]+itemprop=["']price["'][^>]+content=["']([^"']+)["'][^>]*>/i);
      if (metaPrice) price = metaPrice[1];
    }
    if (!price) {
      const priceText = html.match(/(?:price|amount)[^\n]{0,40}([0-9][0-9.,]+)/i);
      if (priceText) price = priceText[1];
    }

    // Prepare description holder early (used in JSON-LD parsing too)
    let description = '';

    // Images via JSON-LD, og:image and <img>
    const images = new Set<string>();
    try {
      const ldBlocks = Array.from(html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi));
      for (const m of ldBlocks) {
        const txt = (m[1] || '').trim();
        try {
          const json = JSON.parse(txt);
          const arr = Array.isArray(json) ? json : [json];
          for (const node of arr) {
            if (node && (node['@type'] === 'Product' || node['@context'])) {
              if (!name && typeof node.name === 'string') name = node.name;
              if (!price && node.offers && (node.offers.price || (node.offers[0]?.price))) {
                price = String(node.offers.price || node.offers[0]?.price);
              }
              const imgList = node.image || node.images || [];
              if (Array.isArray(imgList)) {
                for (const u of imgList) {
                  if (typeof u === 'string' && u.startsWith('http')) images.add(u);
                }
              } else if (typeof imgList === 'string' && imgList.startsWith('http')) {
                images.add(imgList);
              }
              if (!description && typeof node.description === 'string') description = node.description;
            }
          }
        } catch {}
      }
    } catch {}
    const ogImg = getMeta('og:image'); if (ogImg) images.add(ogImg);
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/ig;
    let m: RegExpExecArray | null;
    while ((m = imgRegex.exec(html)) !== null) {
      const src = m[1];
      if (src && src.startsWith('http')) images.add(src);
      if (images.size >= 8) break;
    }

    // Description via og:description or meta description
    if (!description) {
      description = getMeta('og:description') || (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i)?.[1] || '');
    }

    return { name, price, images: Array.from(images), description };
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