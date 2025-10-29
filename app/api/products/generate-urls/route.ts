import { NextRequest, NextResponse } from 'next/server';

interface GenerateUrlsRequest {
  category_id: string;
  count: number;
  min_price?: number;
  max_price?: number;
  sort?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateUrlsRequest = await request.json();
    const { category_id, count, min_price, max_price, sort } = body;

    if (!category_id) {
      return NextResponse.json({
        success: false,
        error: 'category_id est requis'
      }, { status: 400 });
    }

    // Générer les URLs AliExpress avec différentes variations
    const urls = generateAliExpressUrls({
      category_id,
      count,
      min_price,
      max_price,
      sort
    });

    return NextResponse.json({
      success: true,
      urls,
      count: urls.length,
      category_id
    });

  } catch (error) {
    console.error('Erreur génération URLs:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la génération des URLs'
    }, { status: 500 });
  }
}

function generateAliExpressUrls(params: GenerateUrlsRequest): string[] {
  const { category_id, count, min_price, max_price, sort } = params;
  const urls: string[] = [];
  
  // Base URL AliExpress
  const baseUrl = 'https://www.aliexpress.com/wholesale';
  
  // Mots-clés par catégorie pour diversifier les recherches
  const categoryKeywords: Record<string, string[]> = {
    '200000343': ['electronics', 'gadgets', 'tech', 'digital', 'smart'], // Electronics
    '200000345': ['fashion', 'clothing', 'style', 'trendy', 'outfit'], // Fashion
    '509': ['home', 'decor', 'furniture', 'kitchen', 'living'], // Home & Garden
    '44': ['sports', 'fitness', 'outdoor', 'exercise', 'athletic'], // Sports
    '1420': ['beauty', 'cosmetics', 'skincare', 'makeup', 'health'], // Beauty
    '21': ['automotive', 'car', 'vehicle', 'parts', 'accessories'], // Automotive
    '1501': ['jewelry', 'accessories', 'watches', 'rings', 'necklace'], // Jewelry
    '200001996': ['toys', 'games', 'kids', 'children', 'play'], // Toys
    '200001075': ['tools', 'hardware', 'diy', 'construction', 'repair'], // Tools
    '200000532': ['bags', 'luggage', 'backpack', 'handbag', 'travel'] // Bags
  };

  // Obtenir les mots-clés pour cette catégorie ou utiliser des génériques
  const keywords = categoryKeywords[category_id] || ['product', 'item', 'goods', 'quality', 'best'];
  
  // Paramètres de tri
  const sortParams: Record<string, string> = {
    'sales_desc': 'total_tranpro_desc',
    'price_asc': 'price_asc',
    'price_desc': 'price_desc',
    'rating_desc': 'evaluate_rate_desc'
  };

  // Générer différentes variations d'URLs
  const urlsPerKeyword = Math.ceil(count / keywords.length);
  
  keywords.forEach((keyword, keywordIndex) => {
    for (let i = 0; i < urlsPerKeyword && urls.length < count; i++) {
      const params = new URLSearchParams();
      
      // Mot-clé principal
      params.append('SearchText', keyword);
      
      // Catégorie
      params.append('catId', category_id);
      
      // Prix
      if (min_price) {
        params.append('minPrice', min_price.toString());
      }
      if (max_price) {
        params.append('maxPrice', max_price.toString());
      }
      
      // Tri
      if (sort && sortParams[sort]) {
        params.append('SortType', sortParams[sort]);
      }
      
      // Pagination (différentes pages pour plus de variété)
      const page = Math.floor(i / 5) + 1; // 5 URLs par page
      if (page > 1) {
        params.append('page', page.toString());
      }
      
      // Filtres additionnels pour diversifier
      if (i % 3 === 0) {
        params.append('shipFromCountry', 'CN'); // Expédié de Chine
      }
      
      if (i % 4 === 0) {
        params.append('shipToCountry', 'CI'); // Expédié vers Côte d'Ivoire
      }
      
      // Évaluation minimum (alternée)
      if (i % 2 === 0) {
        params.append('minReview', '4'); // Minimum 4 étoiles
      }
      
      // Construire l'URL finale
      const url = `${baseUrl}?${params.toString()}`;
      urls.push(url);
    }
  });

  // Si on n'a pas assez d'URLs, générer des variations supplémentaires
  while (urls.length < count) {
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    const params = new URLSearchParams();
    
    params.append('SearchText', randomKeyword);
    params.append('catId', category_id);
    
    if (min_price) params.append('minPrice', min_price.toString());
    if (max_price) params.append('maxPrice', max_price.toString());
    if (sort && sortParams[sort]) params.append('SortType', sortParams[sort]);
    
    // Page aléatoire entre 1 et 10
    const randomPage = Math.floor(Math.random() * 10) + 1;
    if (randomPage > 1) {
      params.append('page', randomPage.toString());
    }
    
    const url = `${baseUrl}?${params.toString()}`;
    
    // Éviter les doublons
    if (!urls.includes(url)) {
      urls.push(url);
    }
  }

  return urls.slice(0, count); // S'assurer qu'on ne dépasse pas le nombre demandé
}