// Mapping des catégories d'AliExpress/AliBaba vers nos catégories
export const categoryMappings = {
  // AliExpress
  'consumer-electronics': 'electronique',
  'phones-telecommunications': 'electronique',
  'computer-office': 'electronique',
  'security-protection': 'electronique',
  'home-improvement': 'maison-jardin',
  'tools': 'maison-jardin',
  'lights-lighting': 'maison-jardin',
  'home-garden': 'maison-jardin',
  'furniture': 'maison-jardin',
  'home-appliances': 'maison-jardin',
  'men-clothing': 'mode',
  'women-clothing': 'mode',
  'underwear-sleepwear': 'mode',
  'shoes': 'mode',
  'accessories': 'mode',
  'watches': 'mode',
  'jewelry': 'mode',
  'bags-luggage': 'mode',
  'beauty-health': 'beaute-sante',
  'hair-extensions-wigs': 'beaute-sante',
  'sports-entertainment': 'sport-loisirs',
  'toys-hobbies': 'sport-loisirs',
  'automobile-motorcycles': 'auto-moto',
  
  // AliBaba
  'Electronics': 'electronique',
  'Electrical Equipment': 'electronique',
  'Home & Garden': 'maison-jardin',
  'Construction & Real Estate': 'maison-jardin',
  'Lights & Lighting': 'maison-jardin',
  'Furniture': 'maison-jardin',
  'Apparel': 'mode',
  'Fashion Accessories': 'mode',
  'Timepieces, Jewelry': 'mode',
  'Bags, Cases & Boxes': 'mode',
  'Beauty & Personal Care': 'beaute-sante',
  'Health & Medical': 'beaute-sante',
  'Sports & Entertainment': 'sport-loisirs',
  'Toys & Hobbies': 'sport-loisirs',
  'Auto & Transportation': 'auto-moto'
} as const;

export type ImportPlatformCategory = keyof typeof categoryMappings;
export type LocalCategory = typeof categoryMappings[ImportPlatformCategory];

// Fonction pour obtenir notre catégorie locale à partir d'une catégorie de la plateforme
export function mapToLocalCategory(platformCategory: string): LocalCategory | null {
  const mapping = categoryMappings[platformCategory as ImportPlatformCategory];
  return mapping || null;
}

// Fonction pour obtenir toutes nos catégories locales uniques
export function getLocalCategories(): LocalCategory[] {
  return Array.from(new Set(Object.values(categoryMappings)));
}

// Interface pour la suggestion de catégorie
export interface CategorySuggestion {
  sourceCategory: string;
  mappedCategory: LocalCategory | null;
  confidence: number; // 0-1
}