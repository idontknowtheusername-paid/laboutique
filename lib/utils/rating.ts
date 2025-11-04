/**
 * Génère un rating cohérent basé sur l'ID du produit
 * Utilise l'ID comme seed pour avoir toujours le même rating pour le même produit
 */
export function generateConsistentRating(productId: string, actualRating?: number): number {
  // Si on a un vrai rating, on l'utilise
  if (actualRating && actualRating > 0) {
    return actualRating;
  }

  // Sinon, on génère un rating basé sur l'ID du produit (seed)
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    const char = productId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Utilise le hash pour générer un nombre entre 3.0 et 5.0
  const seed = Math.abs(hash) / 2147483647; // Normalise entre 0 et 1
  return 3 + (seed * 2); // Entre 3.0 et 5.0
}

/**
 * Génère un nombre d'avis cohérent basé sur l'ID du produit
 */
export function generateConsistentReviews(productId: string, actualReviews?: number): number {
  // Si on a un vrai nombre d'avis, on l'utilise
  if (actualReviews && actualReviews > 0) {
    return actualReviews;
  }

  // Sinon, on génère un nombre basé sur l'ID du produit
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    const char = productId.charCodeAt(i);
    hash = ((hash << 7) - hash) + char; // Différent seed que le rating
    hash = hash & hash;
  }
  
  // Utilise le hash pour générer un nombre entre 5 et 54
  const seed = Math.abs(hash) / 2147483647;
  return Math.floor(5 + (seed * 50)); // Entre 5 et 54
}