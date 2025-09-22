// Logique intelligente pour associer un produit à une catégorie basée sur son nom
export interface Category {
  id: string;
  name: string;
  slug: string;
  keywords?: string[];
}

// Mots-clés pour chaque catégorie
const categoryKeywords: Record<string, string[]> = {
  'electronique': [
    'smartphone', 'phone', 'téléphone', 'iphone', 'samsung', 'huawei', 'xiaomi',
    'tablet', 'tablette', 'ipad', 'laptop', 'ordinateur', 'pc', 'macbook',
    'écouteurs', 'headphones', 'casque', 'bluetooth', 'wifi', 'câble', 'chargeur',
    'batterie', 'powerbank', 'écran', 'moniteur', 'clavier', 'souris', 'webcam',
    'drone', 'caméra', 'photo', 'vidéo', 'gopro', 'action cam', 'tripod', 'trépied',
    'console', 'jeu', 'gaming', 'ps5', 'xbox', 'nintendo', 'switch', 'manette',
    'smartwatch', 'montre', 'fitness', 'tracker', 'alexa', 'google home', 'smart home',
    'led', 'lamp', 'ampoule', 'éclairage', 'projecteur', 'haut-parleur', 'speaker',
    'tv', 'télévision', 'android tv', 'fire stick', 'chromecast', 'roku'
  ],
  'mode': [
    'robe', 'dress', 'jupe', 'pantalon', 'jean', 't-shirt', 'chemise', 'pull',
    'veste', 'manteau', 'costume', 'cravate', 'chaussure', 'shoe', 'botte',
    'sandal', 'sport', 'running', 'basket', 'sac', 'bag', 'sac à main', 'handbag',
    'bijou', 'jewelry', 'collier', 'bracelet', 'bague', 'ring', 'earring', 'boucle',
    'montre', 'watch', 'ceinture', 'belt', 'chapeau', 'hat', 'casquette', 'cap',
    'écharpe', 'scarf', 'gant', 'glove', 'sous-vêtement', 'lingerie', 'maillot',
    'bikini', 'swimsuit', 'maillot de bain', 'pyjama', 'nightwear', 'robe de soirée',
    'accessoire', 'accessory', 'mode', 'fashion', 'style', 'trendy', 'chic'
  ],
  'beaute': [
    'maquillage', 'makeup', 'fond de teint', 'foundation', 'rouge à lèvres', 'lipstick',
    'mascara', 'eye liner', 'eyeshadow', 'fard', 'blush', 'poudre', 'powder',
    'crème', 'cream', 'sérum', 'serum', 'masque', 'mask', 'nettoyant', 'cleanser',
    'tonique', 'toner', 'hydratant', 'moisturizer', 'anti-âge', 'anti-aging',
    'parfum', 'perfume', 'eau de toilette', 'cologne', 'shampooing', 'shampoo',
    'après-shampooing', 'conditioner', 'gel', 'gel douche', 'shower gel', 'savon',
    'soap', 'huile', 'oil', 'baume', 'balm', 'stick', 'rouge', 'nail', 'ongle',
    'manucure', 'pedicure', 'épilateur', 'rasoir', 'shaver', 'tondeuse', 'trimmer'
  ],
  'maison': [
    'déco', 'décoration', 'decoration', 'tableau', 'picture', 'cadre', 'frame',
    'vase', 'bougie', 'candle', 'lampe', 'lamp', 'éclairage', 'lighting',
    'coussin', 'cushion', 'tapis', 'rug', 'rideau', 'curtain', 'store',
    'linge de maison', 'bedding', 'draps', 'sheets', 'couverture', 'blanket',
    'oreiller', 'pillow', 'serviette', 'towel', 'vaisselle', 'dishes', 'assiette',
    'plate', 'verre', 'glass', 'tasse', 'cup', 'mug', 'bol', 'bowl', 'couverts',
    'cutlery', 'fourchette', 'fork', 'couteau', 'knife', 'cuillère', 'spoon'
  ],
  'jardin': [
    'jardin', 'garden', 'plante', 'plant', 'fleur', 'flower', 'graine', 'seed',
    'pot', 'jardinière', 'planter', 'arrosage', 'watering', 'arrosoir', 'watering can',
    'tondeuse', 'lawn mower', 'sécateur', 'pruner', 'bêche', 'spade', 'pelle',
    'shovel', 'râteau', 'rake', 'outil', 'tool', 'terreau', 'soil', 'engrais',
    'fertilizer', 'serre', 'greenhouse', 'treillis', 'trellis', 'clôture', 'fence'
  ],
  'sport': [
    'sport', 'fitness', 'gym', 'musculation', 'bodybuilding', 'cardio', 'running',
    'course', 'jogging', 'vélo', 'bike', 'bicycle', 'cyclisme', 'cycling',
    'natation', 'swimming', 'piscine', 'pool', 'tennis', 'football', 'soccer',
    'basketball', 'basket', 'volley', 'volleyball', 'badminton', 'ping pong',
    'yoga', 'pilates', 'stretching', 'haltère', 'dumbbell', 'barre', 'bar',
    'machine', 'tapis de course', 'treadmill', 'vélo d\'appartement', 'exercise bike',
    'équipement', 'equipment', 'vêtement sport', 'sportswear', 'chaussure sport'
  ],
  'automobile': [
    'voiture', 'car', 'auto', 'automobile', 'véhicule', 'vehicle', 'pneu', 'tire',
    'roue', 'wheel', 'jante', 'rim', 'frein', 'brake', 'amortisseur', 'shock absorber',
    'filtre', 'filter', 'huile moteur', 'motor oil', 'carburant', 'fuel',
    'batterie auto', 'car battery', 'ampoule', 'bulb', 'phare', 'headlight',
    'pare-choc', 'bumper', 'rétroviseur', 'mirror', 'siège auto', 'car seat',
    'gps', 'navigateur', 'navigator', 'dash cam', 'caméra de recul', 'backup camera'
  ],
  'bebe': [
    'bébé', 'baby', 'enfant', 'child', 'kid', 'jouet', 'toy', 'poupée', 'doll',
    'peluche', 'teddy bear', 'ours', 'jeu', 'game', 'puzzle', 'casse-tête',
    'livre enfant', 'children book', 'vêtement bébé', 'baby clothes', 'body',
    'gigoteuse', 'sleepsack', 'couche', 'diaper', 'biberon', 'bottle',
    'tétine', 'pacifier', 'sucette', 'poussette', 'stroller', 'landau',
    'chaise haute', 'high chair', 'parc', 'playpen', 'berceau', 'crib'
  ]
};

// Fonction pour trouver la meilleure catégorie basée sur le nom du produit
export function findBestCategory(productName: string, availableCategories: Category[]): string | null {
  const normalizedName = productName.toLowerCase();
  
  // Compter les correspondances pour chaque catégorie
  const categoryScores: Record<string, number> = {};
  
  for (const [categorySlug, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    
    for (const keyword of keywords) {
      if (normalizedName.includes(keyword.toLowerCase())) {
        score++;
      }
    }
    
    if (score > 0) {
      categoryScores[categorySlug] = score;
    }
  }
  
  // Trouver la catégorie avec le score le plus élevé
  let bestCategorySlug: string | null = null;
  let maxScore = 0;
  
  for (const [slug, score] of Object.entries(categoryScores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategorySlug = slug;
    }
  }
  
  // Vérifier que la catégorie trouvée existe dans les catégories disponibles
  if (bestCategorySlug) {
    const matchingCategory = availableCategories.find(cat => cat.slug === bestCategorySlug);
    if (matchingCategory) {
      return matchingCategory.id;
    }
  }
  
  return null;
}

// Fonction pour obtenir une catégorie par défaut si aucune correspondance n'est trouvée
export function getDefaultCategory(availableCategories: Category[]): string | null {
  // Priorité des catégories par défaut
  const defaultCategorySlugs = ['electronique', 'mode', 'maison', 'sport'];
  
  for (const slug of defaultCategorySlugs) {
    const category = availableCategories.find(cat => cat.slug === slug);
    if (category) {
      return category.id;
    }
  }
  
  // Si aucune catégorie par défaut n'existe, prendre la première disponible
  return availableCategories.length > 0 ? availableCategories[0].id : null;
}
