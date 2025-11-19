/**
 * SEO Helpers - Utilitaires pour optimiser le référencement
 * JomionStore - 2024
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  price?: number;
  currency?: string;
  availability?: 'in_stock' | 'out_of_stock' | 'preorder';
}

/**
 * Génère un titre SEO optimisé
 * Max 60 caractères pour Google
 */
export function generateSEOTitle(title: string, suffix: string = 'JomionStore'): string {
  const maxLength = 60;
  const fullTitle = `${title} | ${suffix}`;
  
  if (fullTitle.length <= maxLength) {
    return fullTitle;
  }
  
  // Tronquer le titre si trop long
  const availableLength = maxLength - suffix.length - 3; // -3 pour " | "
  return `${title.substring(0, availableLength)}... | ${suffix}`;
}

/**
 * Génère une description SEO optimisée
 * Max 160 caractères pour Google
 */
export function generateSEODescription(description: string): string {
  const maxLength = 160;
  
  if (description.length <= maxLength) {
    return description;
  }
  
  // Tronquer à la dernière phrase complète
  const truncated = description.substring(0, maxLength - 3);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastPeriod > maxLength - 50) {
    return truncated.substring(0, lastPeriod + 1);
  }
  
  return truncated.substring(0, lastSpace) + '...';
}

/**
 * Génère des mots-clés SEO à partir d'un texte
 */
export function generateKeywords(text: string, maxKeywords: number = 10): string[] {
  // Mots vides à ignorer
  const stopWords = [
    'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'mais',
    'pour', 'avec', 'dans', 'sur', 'par', 'ce', 'cette', 'ces', 'à', 'au',
    'aux', 'en', 'qui', 'que', 'quoi', 'dont', 'où', 'est', 'sont', 'a', 'ont'
  ];
  
  // Nettoyer et diviser le texte
  const words = text
    .toLowerCase()
    .replace(/[^\w\sàâäéèêëïîôùûüÿæœç]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word));
  
  // Compter les occurrences
  const wordCount: { [key: string]: number } = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Trier par fréquence et retourner les plus fréquents
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Génère un slug SEO-friendly à partir d'un texte
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
    .replace(/[^\w\s-]/g, '') // Retirer les caractères spéciaux
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-') // Remplacer les tirets multiples
    .replace(/^-+|-+$/g, ''); // Retirer les tirets au début et à la fin
}

/**
 * Génère des données structurées Schema.org pour un produit
 */
export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string[];
  price: number;
  currency?: string;
  availability?: string;
  brand?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  url?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'XOF',
      availability: product.availability 
        ? `https://schema.org/${product.availability === 'in_stock' ? 'InStock' : 'OutOfStock'}`
        : 'https://schema.org/InStock',
      url: product.url || '',
    },
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand,
    } : undefined,
    sku: product.sku,
    aggregateRating: product.rating && product.reviewCount ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    } : undefined,
  };
}

/**
 * Génère des données structurées Schema.org pour une organisation
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'JomionStore',
    url: 'https://www.jomionstore.com',
    logo: 'https://www.jomionstore.com/images/latestlogo.jpg',
    description: 'Le centre commercial digital du Bénin - Shopping en ligne avec livraison rapide',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BJ',
      addressLocality: 'Cotonou',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+229-XX-XX-XX-XX',
      contactType: 'Customer Service',
      availableLanguage: ['fr', 'en'],
    },
    sameAs: [
      'https://www.facebook.com/JomionStore',
      'https://www.instagram.com/jomionstore',
      'https://twitter.com/JomionStoreBenin',
      'https://www.tiktok.com/@jomionstore',
    ],
  };
}

/**
 * Génère des données structurées Schema.org pour un breadcrumb
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Génère des Open Graph tags optimisés
 */
export function generateOpenGraphTags(metadata: SEOMetadata) {
  const baseUrl = 'https://www.jomionstore.com';
  
  return {
    'og:type': metadata.type || 'website',
    'og:url': metadata.url || baseUrl,
    'og:title': metadata.title,
    'og:description': metadata.description,
    'og:image': metadata.image || `${baseUrl}/images/latestlogo.jpg`,
    'og:site_name': 'JomionStore',
    'og:locale': 'fr_BJ',
    ...(metadata.price && {
      'product:price:amount': metadata.price,
      'product:price:currency': metadata.currency || 'XOF',
    }),
    ...(metadata.availability && {
      'product:availability': metadata.availability,
    }),
  };
}

/**
 * Génère des Twitter Card tags optimisés
 */
export function generateTwitterCardTags(metadata: SEOMetadata) {
  const baseUrl = 'https://www.jomionstore.com';
  
  return {
    'twitter:card': 'summary_large_image',
    'twitter:site': '@JomionStoreBenin',
    'twitter:creator': '@JomionStoreBenin',
    'twitter:title': metadata.title,
    'twitter:description': metadata.description,
    'twitter:image': metadata.image || `${baseUrl}/images/latestlogo.jpg`,
  };
}

/**
 * Valide et nettoie une URL pour le SEO
 */
export function cleanURL(url: string): string {
  try {
    const urlObj = new URL(url);
    // Retirer les paramètres de tracking
    const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid'];
    paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Génère une URL canonique
 */
export function generateCanonicalURL(path: string): string {
  const baseUrl = 'https://www.jomionstore.com';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Calcule le temps de lecture estimé (en minutes)
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Extrait le texte brut d'un HTML (pour les descriptions)
 */
export function stripHTML(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Retirer les tags HTML
    .replace(/&nbsp;/g, ' ') // Remplacer les espaces insécables
    .replace(/&amp;/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/'/g, "'")
    .trim();
}

/**
 * Vérifie si une URL est valide
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Génère des suggestions de mots-clés basées sur une catégorie
 */
export function generateCategoryKeywords(categoryName: string): string[] {
  const baseKeywords = [
    'acheter',
    'vente',
    'prix',
    'pas cher',
    'qualité',
    'livraison',
    'bénin',
    'cotonou',
    'en ligne',
  ];
  
  return [
    categoryName.toLowerCase(),
    `${categoryName.toLowerCase()} bénin`,
    `acheter ${categoryName.toLowerCase()}`,
    `${categoryName.toLowerCase()} en ligne`,
    `${categoryName.toLowerCase()} pas cher`,
    ...baseKeywords,
  ];
}
