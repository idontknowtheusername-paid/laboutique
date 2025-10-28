type CategoryRecord = { id: string; name: string; slug?: string };

const DEFAULT_CATEGORY_ID = 'c1011f0a-a196-4678-934a-85ae8b9cff35';

// Expressions prioritaires (matchées en premier, score très élevé)
const PRIORITY_PHRASES: Record<string, string[]> = {
  'electronique': [
    'montre intelligente', 'smartwatch', 'montre connectée', 'smart watch',
    'écran tactile', 'touch screen', 'appareil photo', 'caméra numérique',
    'console de jeu', 'manette sans fil', 'clavier mécanique'
  ],
  'telephones-accessoires': [
    'coque iphone', 'coque samsung', 'protection écran', 'film protecteur',
    'chargeur sans fil', 'câble lightning', 'câble usb-c', 'airpods'
  ],
  'ordinateurs-tablettes': [
    'ordinateur portable', 'pc portable', 'macbook', 'chromebook',
    'tablette tactile', 'ipad', 'clavier sans fil', 'souris gaming'
  ],
  'audio-video': [
    'écouteurs bluetooth', 'casque audio', 'enceinte bluetooth',
    'barre de son', 'home cinema', 'micro sans fil'
  ],
  'gaming-vr': [
    'casque vr', 'casque réalité virtuelle', 'ps5', 'xbox series',
    'nintendo switch', 'manette ps5', 'jeu vidéo'
  ],
  'fitness-musculation': [
    'tapis de course', 'vélo appartement', 'banc de musculation',
    'haltère réglable', 'barre de traction', 'appareil abdominaux'
  ],
  'sport-loisirs': [
    'raquette de tennis', 'ballon de football', 'équipement camping',
    'sac de couchage', 'tente camping', 'bâton de randonnée',
    'équipement sport', 'accessoire sport', 'matériel sport',
    'ballon basket', 'ballon volley', 'raquette badminton'
  ],
  'sports-exterieur': [
    'vélo électrique', 'trottinette électrique', 'skateboard électrique',
    'planche de surf', 'kayak gonflable', 'paddle gonflable'
  ],
  'vetements-femme': [
    'robe femme', 'jupe femme', 'chemisier femme', 'pantalon femme',
    'combinaison femme', 'lingerie femme', 'maillot de bain femme'
  ],
  'vetements-homme': [
    'chemise homme', 'pantalon homme', 'costume homme', 'jean homme',
    'polo homme', 'short homme', 'sous-vêtement homme',
    'pantalon survêtement homme', 'jogging homme', 'sweat homme',
    'veste homme', 'blouson homme', 't-shirt homme'
  ],
  'vetements-enfant': [
    'combinaison ski enfant', 'manteau enfant', 'robe enfant',
    'pyjama enfant', 'body bébé', 'grenouillère bébé',
    'vêtement enfant', 'habit enfant', 'tenue enfant',
    'pantalon enfant', 'pull enfant', 'gilet enfant',
    'combinaison enfant', 'barboteuse bébé', 'salopette enfant'
  ],
  'chaussures': [
    'chaussure running', 'basket sport', 'chaussure trail',
    'sneakers homme', 'sneakers femme', 'bottines cuir', 'sandales été',
    'chaussure sport', 'basket running', 'chaussure fitness',
    'chaussure jogging', 'chaussure marche', 'chaussure tennis'
  ],
  'montres-bijoux': [
    'montre automatique', 'montre mécanique', 'montre quartz',
    'collier or', 'boucle oreille', 'bracelet argent', 'bague diamant'
  ],
  'sacs-maroquinerie': [
    'sac à main', 'sac bandoulière', 'sac dos', 'portefeuille cuir',
    'cartable école', 'valise cabine', 'trousse maquillage'
  ],
  'cosmetiques-soins': [
    'crème visage', 'sérum anti-âge', 'masque cheveux', 'huile essentielle',
    'fond de teint', 'rouge à lèvres', 'mascara waterproof', 'shampooing bio'
  ],
  'electromenager': [
    'machine à laver', 'lave-vaisselle', 'réfrigérateur', 'congélateur',
    'micro-ondes', 'four électrique', 'aspirateur robot', 'robot cuiseur'
  ],
  'cuisine-salle-bain': [
    'mixeur plongeant', 'blender smoothie', 'cafetière électrique',
    'grille-pain', 'bouilloire électrique', 'pommeau douche', 'robinet cuisine'
  ],
  'maison-jardin': [
    'canapé convertible', 'table basse', 'étagère murale', 'cadre photo',
    'coussin décoratif', 'rideau occultant', 'tapis salon'
  ],
  'bebe-enfant': [
    'poussette bébé', 'siège auto', 'lit bébé', 'chaise haute',
    'biberon anti-colique', 'couche lavable', 'tétine physiologique'
  ],
  'jeux-jouets': [
    'lego', 'playmobil', 'poupée barbie', 'peluche géante',
    'puzzle 1000 pièces', 'jeu société', 'voiture télécommandée'
  ],
  'automobile-moto': [
    'dash cam', 'caméra embarquée', 'support téléphone voiture',
    'chargeur voiture', 'housse siège auto', 'tapis voiture'
  ]
};

// Mots-clés par catégorie (score moyen)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'electronique': [
    'électronique', 'electronic', 'gadget', 'tech', 'numérique', 'digital',
    'lcd', 'led', 'oled', 'bluetooth', 'wifi', 'wireless', 'sans fil'
  ],
  'telephones-accessoires': [
    'iphone', 'samsung', 'xiaomi', 'huawei', 'smartphone', 'téléphone',
    'mobile', 'cellulaire', 'coque', 'étui', 'protection', 'verre trempé'
  ],
  'ordinateurs-tablettes': [
    'ordinateur', 'laptop', 'notebook', 'pc', 'tablette', 'ipad',
    'surface', 'chromebook', 'ultrabook', 'macbook', 'ssd', 'ram'
  ],
  'audio-video': [
    'audio', 'vidéo', 'écouteur', 'casque', 'headphone', 'earbuds',
    'enceinte', 'speaker', 'haut-parleur', 'soundbar', 'subwoofer',
    'amplificateur', 'microphone', 'micro', 'webcam', 'caméra'
  ],
  'gaming-vr': [
    'gaming', 'gamer', 'game', 'jeu vidéo', 'console', 'playstation',
    'xbox', 'nintendo', 'switch', 'ps4', 'ps5', 'vr', 'réalité virtuelle',
    'manette', 'controller', 'joystick', 'racing wheel'
  ],
  'fitness-musculation': [
    'fitness', 'musculation', 'gym', 'workout', 'training', 'cardio',
    'tapis', 'treadmill', 'vélo', 'elliptique', 'rameur', 'haltère',
    'dumbbell', 'kettlebell', 'barre', 'poids', 'weight', 'banc'
  ],
  'sport-loisirs': [
    'sport', 'sportif', 'loisir', 'activité', 'récréation', 'outdoor',
    'tennis', 'badminton', 'ping-pong', 'football', 'basketball',
    'volley', 'yoga', 'pilates', 'natation', 'piscine', 'camping'
  ],
  'sports-exterieur': [
    'extérieur', 'outdoor', 'vélo', 'cyclisme', 'bike', 'trottinette',
    'scooter', 'skateboard', 'roller', 'ski', 'snowboard', 'surf',
    'kayak', 'paddle', 'randonnée', 'hiking', 'escalade', 'climbing'
  ],
  'vetements-femme': [
    'femme', 'woman', 'women', 'lady', 'féminin', 'robe', 'dress',
    'jupe', 'skirt', 'chemisier', 'blouse', 'top', 'débardeur',
    'combinaison', 'jumpsuit', 'lingerie', 'brassière'
  ],
  'vetements-homme': [
    'homme', 'man', 'men', 'masculin', 'chemise', 'shirt', 'polo',
    'costume', 'suit', 'veste', 'jacket', 'blouson', 'caleçon', 'boxer'
  ],
  'vetements-enfant': [
    'enfant', 'child', 'kid', 'junior', 'bébé', 'baby', 'nouveau-né',
    'nourrisson', 'bambin', 'toddler', 'garçon', 'boy', 'fille', 'girl',
    'ado', 'adolescent', 'teen'
  ],
  'chaussures': [
    'chaussure', 'shoe', 'basket', 'sneaker', 'running', 'trail',
    'botte', 'boot', 'bottine', 'sandale', 'sandal', 'tong', 'flip-flop',
    'espadrille', 'mocassin', 'derby', 'richelieu', 'ballerine'
  ],
  'montres-bijoux': [
    'montre', 'watch', 'horloge', 'chronographe', 'bijou', 'jewelry',
    'collier', 'necklace', 'bracelet', 'bague', 'ring', 'boucle',
    'earring', 'pendentif', 'pendant', 'or', 'gold', 'argent', 'silver'
  ],
  'sacs-maroquinerie': [
    'sac', 'bag', 'sacoche', 'besace', 'bandoulière', 'messenger',
    'dos', 'backpack', 'cartable', 'portefeuille', 'wallet', 'porte-monnaie',
    'porte-carte', 'trousse', 'pochette', 'clutch', 'cuir', 'leather'
  ],
  'cosmetiques-soins': [
    'cosmétique', 'beauté', 'beauty', 'maquillage', 'makeup', 'soin',
    'care', 'crème', 'cream', 'sérum', 'serum', 'lotion', 'gel',
    'masque', 'mask', 'gommage', 'scrub', 'parfum', 'perfume',
    'shampooing', 'shampoo', 'après-shampooing', 'conditioner'
  ],
  'sante-bien-etre': [
    'santé', 'health', 'bien-être', 'wellness', 'médical', 'medical',
    'thérapie', 'therapy', 'massage', 'relaxation', 'tensiomètre',
    'thermomètre', 'oxymètre', 'glycémie', 'balance', 'pèse-personne'
  ],
  'electromenager': [
    'électroménager', 'appliance', 'ménager', 'machine', 'lave-linge',
    'lave-vaisselle', 'réfrigérateur', 'frigo', 'congélateur', 'freezer',
    'four', 'oven', 'cuisinière', 'hotte', 'aspirateur', 'vacuum'
  ],
  'cuisine-salle-bain': [
    'cuisine', 'kitchen', 'culinaire', 'ustensile', 'cookware',
    'casserole', 'poêle', 'pan', 'couteau', 'knife', 'planche',
    'mixeur', 'blender', 'robot', 'cafetière', 'coffee', 'théière',
    'salle de bain', 'bathroom', 'douche', 'shower', 'robinet'
  ],
  'maison-jardin': [
    'maison', 'home', 'déco', 'décoration', 'decoration', 'intérieur',
    'meuble', 'furniture', 'canapé', 'sofa', 'table', 'chaise', 'chair',
    'lit', 'bed', 'armoire', 'étagère', 'shelf', 'coussin', 'cushion',
    'rideau', 'curtain', 'tapis', 'rug', 'jardin', 'garden'
  ],
  'luminaires': [
    'luminaire', 'lampe', 'lamp', 'éclairage', 'lighting', 'applique',
    'plafonnier', 'ceiling', 'suspension', 'pendant', 'liseuse',
    'veilleuse', 'night light', 'led', 'ampoule', 'bulb', 'néon'
  ],
  'jardinage-outils': [
    'jardinage', 'gardening', 'jardin', 'garden', 'plante', 'plant',
    'fleur', 'flower', 'graine', 'seed', 'terreau', 'soil', 'pot',
    'arrosoir', 'tondeuse', 'mower', 'taille-haie', 'sécateur'
  ],
  'outils-bricolage': [
    'outil', 'tool', 'bricolage', 'diy', 'perceuse', 'drill',
    'visseuse', 'screwdriver', 'marteau', 'hammer', 'scie', 'saw',
    'clé', 'wrench', 'pince', 'pliers', 'tournevis', 'niveau', 'level'
  ],
  'bebe-enfant': [
    'bébé', 'baby', 'enfant', 'child', 'puériculture', 'nouveau-né',
    'poussette', 'stroller', 'landau', 'siège auto', 'car seat',
    'lit bébé', 'crib', 'chaise haute', 'high chair', 'biberon', 'bottle',
    'couche', 'diaper', 'tétine', 'pacifier', 'babyphone', 'monitor'
  ],
  'jeux-jouets': [
    'jouet', 'toy', 'jeu', 'game', 'puzzle', 'construction', 'lego',
    'playmobil', 'poupée', 'doll', 'peluche', 'plush', 'figurine',
    'action figure', 'voiture', 'car', 'train', 'avion', 'plane',
    'robot', 'déguisement', 'costume', 'société', 'board game'
  ],
  'livre-papeterie': [
    'livre', 'book', 'roman', 'novel', 'bd', 'manga', 'comics',
    'magazine', 'journal', 'cahier', 'notebook', 'carnet', 'stylo',
    'pen', 'crayon', 'pencil', 'marqueur', 'marker', 'feutre',
    'papier', 'paper', 'agenda', 'planner', 'calendrier'
  ],
  'instruments-musique': [
    'instrument', 'musique', 'music', 'musical', 'guitare', 'guitar',
    'piano', 'keyboard', 'batterie', 'drums', 'violon', 'violin',
    'flûte', 'flute', 'saxophone', 'trompette', 'trumpet', 'basse',
    'ukulélé', 'harmonica', 'partition', 'sheet music'
  ],
  'automobile-moto': [
    'voiture', 'car', 'auto', 'automobile', 'véhicule', 'vehicle',
    'moto', 'motorcycle', 'scooter', 'accessoire auto', 'pneu', 'tire',
    'jante', 'wheel', 'batterie', 'battery', 'huile', 'oil', 'filtre',
    'ampoule', 'bulb', 'essuie-glace', 'wiper', 'tapis', 'mat'
  ],
  'animaux-accessoires': [
    'animal', 'pet', 'chien', 'dog', 'chat', 'cat', 'oiseau', 'bird',
    'poisson', 'fish', 'rongeur', 'hamster', 'lapin', 'rabbit',
    'gamelle', 'bowl', 'cage', 'aquarium', 'litière', 'litter',
    'collier', 'collar', 'laisse', 'leash', 'jouet', 'croquette'
  ],
  'voyage-bagages': [
    'voyage', 'travel', 'valise', 'suitcase', 'baggage', 'bagage',
    'trolley', 'cabine', 'cabin', 'sac voyage', 'travel bag',
    'organisateur', 'organizer', 'housse', 'cover', 'cadenas', 'lock',
    'étiquette', 'tag', 'pochette', 'passport', 'passeport'
  ],
  'mobilier': [
    'mobilier', 'furniture', 'meuble', 'canapé', 'sofa', 'fauteuil',
    'armchair', 'table', 'bureau', 'desk', 'chaise', 'chair',
    'tabouret', 'stool', 'lit', 'bed', 'matelas', 'mattress',
    'armoire', 'wardrobe', 'commode', 'dresser', 'bibliothèque'
  ]
};

// Mots d'exclusion pour éviter les faux positifs
const EXCLUSION_RULES: Record<string, string[]> = {
  'montres-bijoux': ['intelligente', 'connectée', 'smart', 'fitness', 'sport', 'bluetooth', 'wifi', 'écran'],
  'mode-beaute': ['intelligent', 'électronique', 'numérique', 'digital', 'bluetooth', 'wifi', 'connecté'],
  'chaussures': ['intelligente', 'connectée', 'smart', 'bluetooth'], // Éviter confusion avec montres
  'sacs-maroquinerie': ['intelligent', 'électronique', 'connecté'] // Éviter confusion avec accessoires tech
};

/**
 * Normalise une chaîne de caractères (minuscules, sans accents)
 */
function normalize(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Vérifie si un mot d'exclusion est présent
 */
function hasExclusion(productName: string, categorySlug: string): boolean {
  const exclusions = EXCLUSION_RULES[categorySlug];
  if (!exclusions) return false;

  const normalized = normalize(productName);
  return exclusions.some(exclusion => normalized.includes(normalize(exclusion)));
}

/**
 * Trouve la meilleure catégorie pour un produit
 */
export function findBestCategory(
  productName: string,
  categories: CategoryRecord[]
): string | null {
  if (!productName || !categories.length) return null;

  const normalized = normalize(productName);
  const scores: Map<string, number> = new Map();

  // 1. PHRASES PRIORITAIRES (score = 100 par match)
  for (const [slug, phrases] of Object.entries(PRIORITY_PHRASES)) {
    for (const phrase of phrases) {
      if (normalized.includes(normalize(phrase))) {
        const current = scores.get(slug) || 0;
        scores.set(slug, current + 100);
      }
    }
  }

  // 2. MOTS-CLÉS STANDARDS (score = 10 par match)
  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalized.includes(normalize(keyword))) {
        const current = scores.get(slug) || 0;
        scores.set(slug, current + 10);
      }
    }
  }

  // 3. MATCH AVEC NOM/SLUG DE CATÉGORIE (score = 20)
  for (const category of categories) {
    const catName = normalize(category.name);
    const catSlug = normalize(category.slug || '');

    if (catSlug && normalized.includes(catSlug)) {
      const current = scores.get(catSlug) || 0;
      scores.set(catSlug, current + 20);
    }

    // Match partiel sur le nom de catégorie
    const nameParts = catName.split(/[\s&-]+/);
    for (const part of nameParts) {
      if (part.length > 3 && normalized.includes(part)) {
        const current = scores.get(catSlug) || 0;
        scores.set(catSlug, current + 5);
      }
    }
  }

  // 4. APPLIQUER LES RÈGLES D'EXCLUSION
  for (const [slug, score] of scores.entries()) {
    if (hasExclusion(productName, slug)) {
      scores.set(slug, Math.floor(score * 0.3)); // Réduit le score de 70%
    }
  }

  // 5. TROUVER LA CATÉGORIE AVEC LE MEILLEUR SCORE
  let bestSlug: string | null = null;
  let bestScore = 0;

  for (const [slug, score] of scores.entries()) {
    if (score > bestScore) {
      bestScore = score;
      bestSlug = slug;
    }
  }

  // 6. RETOURNER L'ID DE LA CATÉGORIE CORRESPONDANTE
  if (bestSlug && bestScore > 0) {
    const matchedCategory = categories.find(
      cat => normalize(cat.slug || '') === bestSlug
    );
    return matchedCategory?.id || null;
  }

  return null;
}

/**
 * Version alternative utilisant uniquement les mots-clés
 */
export function findBestCategoryByKeywords(
  productName: string,
  availableCategories: CategoryRecord[]
): string | null {
  return findBestCategory(productName, availableCategories);
}

/**
 * Retourne l'ID de la catégorie par défaut
 */
export function getDefaultCategory(): string {
  return DEFAULT_CATEGORY_ID;
}