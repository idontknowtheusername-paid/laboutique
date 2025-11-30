/**
 * Système de tags automatique pour les produits importés
 * Analyse le nom et la description pour assigner des tags et améliorer la catégorisation
 */

export interface ProductTag {
  name: string;
  category: string;
  confidence: number; // 0-1
}

export interface TaggingResult {
  tags: ProductTag[];
  suggestedCategory: string | null;
  confidence: number;
}

// Dictionnaire de mots-clés par catégorie
const categoryKeywords = {
  'electronique': [
    'phone', 'smartphone', 'iphone', 'samsung', 'xiaomi', 'huawei',
    'headphone', 'earphone', 'bluetooth', 'wireless', 'charger', 'cable',
    'speaker', 'tablet', 'ipad', 'laptop', 'computer', 'mouse', 'keyboard',
    'camera', 'smartwatch', 'fitness', 'tracker', 'power bank', 'adapter',
    'écouteurs', 'casque', 'chargeur', 'câble', 'haut-parleur', 'tablette',
    'ordinateur', 'souris', 'clavier', 'caméra', 'montre connectée'
  ],
  'mode-accessoires': [
    'bag', 'handbag', 'backpack', 'wallet', 'purse', 'belt', 'watch',
    'jewelry', 'necklace', 'bracelet', 'ring', 'earring', 'sunglasses',
    'hat', 'cap', 'scarf', 'gloves', 'shoes', 'sneakers', 'boots',
    'sac', 'sac à dos', 'portefeuille', 'ceinture', 'montre', 'bijoux',
    'collier', 'bracelet', 'bague', 'boucles d\'oreilles', 'lunettes',
    'chapeau', 'casquette', 'écharpe', 'gants', 'chaussures', 'baskets'
  ],
  'maison-jardin': [
    'home', 'kitchen', 'dining', 'bedroom', 'bathroom', 'living room',
    'furniture', 'chair', 'table', 'bed', 'sofa', 'lamp', 'curtain',
    'pillow', 'blanket', 'towel', 'cup', 'plate', 'bowl', 'knife',
    'garden', 'plant', 'flower', 'pot', 'tool', 'decoration',
    'maison', 'cuisine', 'chambre', 'salle de bain', 'salon', 'meuble',
    'chaise', 'table', 'lit', 'canapé', 'lampe', 'rideau', 'oreiller',
    'couverture', 'serviette', 'tasse', 'assiette', 'bol', 'couteau',
    'jardin', 'plante', 'fleur', 'pot', 'outil', 'décoration'
  ],
  'vetements': [
    'shirt', 't-shirt', 'dress', 'pants', 'jeans', 'shorts', 'skirt',
    'jacket', 'coat', 'sweater', 'hoodie', 'underwear', 'socks',
    'pajama', 'swimwear', 'bikini', 'lingerie', 'bra', 'panties',
    'chemise', 'robe', 'pantalon', 'jean', 'short', 'jupe', 'veste',
    'manteau', 'pull', 'sweat', 'sous-vêtements', 'chaussettes',
    'pyjama', 'maillot de bain', 'lingerie', 'soutien-gorge', 'culotte'
  ],
  'beaute-sante': [
    'makeup', 'cosmetic', 'lipstick', 'foundation', 'mascara', 'eyeshadow',
    'skincare', 'cream', 'serum', 'cleanser', 'moisturizer', 'sunscreen',
    'perfume', 'fragrance', 'nail', 'polish', 'hair', 'shampoo',
    'conditioner', 'brush', 'comb', 'health', 'vitamin', 'supplement',
    'maquillage', 'cosmétique', 'rouge à lèvres', 'fond de teint',
    'mascara', 'fard à paupières', 'soin', 'crème', 'sérum', 'nettoyant',
    'hydratant', 'crème solaire', 'parfum', 'vernis', 'cheveux',
    'shampooing', 'après-shampooing', 'brosse', 'peigne', 'santé',
    'vitamine', 'complément'
  ],
  'sport-loisirs': [
    'sport', 'fitness', 'gym', 'yoga', 'running', 'cycling', 'swimming',
    'basketball', 'football', 'tennis', 'golf', 'hiking', 'camping',
    'outdoor', 'bike', 'bicycle', 'skateboard', 'roller', 'game',
    'toy', 'puzzle', 'book', 'music', 'instrument', 'guitar',
    'sport', 'fitness', 'gym', 'yoga', 'course', 'cyclisme', 'natation',
    'basketball', 'football', 'tennis', 'golf', 'randonnée', 'camping',
    'extérieur', 'vélo', 'bicyclette', 'skateboard', 'roller', 'jeu',
    'jouet', 'puzzle', 'livre', 'musique', 'instrument', 'guitare'
  ],
  'auto-moto': [
    'car', 'auto', 'vehicle', 'motorcycle', 'bike', 'tire', 'wheel',
    'engine', 'oil', 'brake', 'battery', 'light', 'mirror', 'seat',
    'cover', 'mat', 'charger', 'holder', 'gps', 'dash cam',
    'voiture', 'auto', 'véhicule', 'moto', 'pneu', 'roue', 'moteur',
    'huile', 'frein', 'batterie', 'lumière', 'miroir', 'siège',
    'housse', 'tapis', 'chargeur', 'support', 'gps', 'caméra'
  ]
};

// Mots-clés spéciaux pour les feeds
const feedKeywords = {
  'ds-bestselling': ['popular', 'best seller', 'top rated', 'trending'],
  'ds-new-arrival': ['new', 'latest', 'fresh', 'recent', 'nouveau'],
  'ds-promotion': ['sale', 'discount', 'promo', 'deal', 'offer', 'solde'],
  'ds-choice': ['premium', 'quality', 'selected', 'choice', 'premium']
};

/**
 * Analyse un nom de produit et retourne des tags automatiques
 */
export function analyzeProductName(productName: string, feedType?: string): TaggingResult {
  const name = productName.toLowerCase();
  const tags: ProductTag[] = [];
  let suggestedCategory: string | null = null;
  let maxConfidence = 0;

  // Analyser par catégorie
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let matches = 0;
    let totalKeywords = keywords.length;

    for (const keyword of keywords) {
      if (name.includes(keyword.toLowerCase())) {
        matches++;
      }
    }

    if (matches > 0) {
      const confidence = matches / totalKeywords;
      
      tags.push({
        name: category,
        category: 'product_category',
        confidence
      });

      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        suggestedCategory = category;
      }
    }
  }

  // Ajouter des tags basés sur le feed
  if (feedType && feedKeywords[feedType as keyof typeof feedKeywords]) {
    tags.push({
      name: feedType.replace('ds-', ''),
      category: 'feed_type',
      confidence: 0.8
    });
  }

  // Tags génériques basés sur des mots-clés communs
  const genericTags = extractGenericTags(name);
  tags.push(...genericTags);

  return {
    tags: tags.sort((a, b) => b.confidence - a.confidence),
    suggestedCategory,
    confidence: maxConfidence
  };
}

/**
 * Extrait des tags génériques du nom du produit
 */
function extractGenericTags(name: string): ProductTag[] {
  const tags: ProductTag[] = [];

  // Matériaux
  const materials = ['leather', 'cotton', 'silk', 'wool', 'plastic', 'metal', 'wood', 'glass', 'ceramic'];
  materials.forEach(material => {
    if (name.includes(material)) {
      tags.push({ name: material, category: 'material', confidence: 0.6 });
    }
  });

  // Couleurs
  const colors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'brown', 'gray'];
  colors.forEach(color => {
    if (name.includes(color)) {
      tags.push({ name: color, category: 'color', confidence: 0.5 });
    }
  });

  // Tailles
  const sizes = ['small', 'medium', 'large', 'xl', 'xxl', 's', 'm', 'l'];
  sizes.forEach(size => {
    if (name.includes(size)) {
      tags.push({ name: size, category: 'size', confidence: 0.4 });
    }
  });

  // Marques populaires
  const brands = ['apple', 'samsung', 'nike', 'adidas', 'sony', 'lg', 'xiaomi', 'huawei'];
  brands.forEach(brand => {
    if (name.includes(brand)) {
      tags.push({ name: brand, category: 'brand', confidence: 0.7 });
    }
  });

  return tags;
}

/**
 * Améliore la catégorisation d'un produit basé sur ses tags
 */
export function improveCategorization(
  productName: string, 
  currentCategoryId: string | null, 
  availableCategories: Array<{ id: string; name: string; slug: string }>,
  feedType?: string
): string | null {
  const analysis = analyzeProductName(productName, feedType);
  
  if (!analysis.suggestedCategory || analysis.confidence < 0.3) {
    return currentCategoryId; // Garder la catégorie actuelle si pas assez confiant
  }

  // Chercher une catégorie correspondante
  const matchingCategory = availableCategories.find(cat => 
    cat.slug.includes(analysis.suggestedCategory!) || 
    cat.name.toLowerCase().includes(analysis.suggestedCategory!)
  );

  return matchingCategory ? matchingCategory.id : currentCategoryId;
}

/**
 * Génère des mots-clés SEO basés sur les tags
 */
export function generateSEOKeywords(tags: ProductTag[]): string[] {
  return tags
    .filter(tag => tag.confidence > 0.4)
    .map(tag => tag.name)
    .slice(0, 10); // Max 10 mots-clés
}

/**
 * Génère une description enrichie basée sur les tags
 * NETTOIE les informations techniques qui ne doivent pas être visibles par les clients
 */
export function enrichProductDescription(
  originalDescription: string, 
  tags: ProductTag[], 
  feedType?: string
): string {
  // 🧹 NETTOYAGE : Supprimer les informations techniques d'import
  let cleanedDescription = originalDescription || '';

  // Supprimer les mentions d'import AliExpress
  cleanedDescription = cleanedDescription.replace(/Produit importé depuis AliExpress.*?API\./gi, '');
  cleanedDescription = cleanedDescription.replace(/Imported from AliExpress.*?API\./gi, '');

  // Supprimer les métadonnées techniques (Note, Ventes récentes, etc.)
  cleanedDescription = cleanedDescription.replace(/Caractéristiques:\s*-\s*Note:.*?-\s*Ventes récentes:.*?\d+/gi, '');
  cleanedDescription = cleanedDescription.replace(/Features:\s*-\s*Rating:.*?-\s*Recent sales:.*?\d+/gi, '');

  // Supprimer les lignes vides multiples
  cleanedDescription = cleanedDescription.replace(/\n\s*\n\s*\n/g, '\n\n');

  // Supprimer les espaces en début et fin
  cleanedDescription = cleanedDescription.trim();

  // Si la description est vide après nettoyage, créer une description basique
  if (!cleanedDescription) {
    cleanedDescription = 'Produit de qualité disponible sur JomionStore.';
  }

  const categoryTags = tags.filter(tag => tag.category === 'product_category' && tag.confidence > 0.5);
  const materialTags = tags.filter(tag => tag.category === 'material');
  const colorTags = tags.filter(tag => tag.category === 'color');

  let enrichedDescription = cleanedDescription;

  // Ajouter des informations basées sur les tags (optionnel, commenté pour garder propre)
  // if (categoryTags.length > 0) {
  //   enrichedDescription += `\n\nCatégorie: ${categoryTags[0].name}`;
  // }

  // if (materialTags.length > 0) {
  //   enrichedDescription += `\nMatériau: ${materialTags.map(t => t.name).join(', ')}`;
  // }

  // if (colorTags.length > 0) {
  //   enrichedDescription += `\nCouleurs disponibles: ${colorTags.map(t => t.name).join(', ')}`;
  // }

  // NE PLUS ajouter les infos de feed dans la description visible
  // Ces infos sont pour usage interne uniquement

  return enrichedDescription;
}
