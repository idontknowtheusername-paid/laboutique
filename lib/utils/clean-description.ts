/**
 * Nettoie les descriptions de produits en supprimant les informations techniques
 * et les métadonnées d'import qui ne doivent pas être visibles par les clients
 */
export function cleanProductDescription(description: string | null | undefined): string {
  if (!description) return '';

  let cleaned = description;

  // Supprimer les mentions d'import AliExpress
  cleaned = cleaned.replace(/Produit importé depuis AliExpress.*?API\./gi, '');
  cleaned = cleaned.replace(/Imported from AliExpress.*?API\./gi, '');
  
  // Supprimer les métadonnées techniques (Note, Ventes récentes, etc.)
  cleaned = cleaned.replace(/Caractéristiques:\s*-\s*Note:.*?-\s*Ventes récentes:.*?\d+/gi, '');
  cleaned = cleaned.replace(/Features:\s*-\s*Rating:.*?-\s*Recent sales:.*?\d+/gi, '');
  
  // Supprimer les lignes vides multiples
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Supprimer les espaces en début et fin
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Nettoie une description courte
 */
export function cleanShortDescription(shortDescription: string | null | undefined): string {
  if (!shortDescription) return '';

  let cleaned = shortDescription;

  // Supprimer les mentions d'import
  cleaned = cleaned.replace(/Produit importé.*?API\./gi, '');
  cleaned = cleaned.replace(/Imported from.*?API\./gi, '');
  
  // Supprimer les métadonnées
  cleaned = cleaned.replace(/Note:.*?\d+\.?\d*/gi, '');
  cleaned = cleaned.replace(/Rating:.*?\d+\.?\d*/gi, '');
  cleaned = cleaned.replace(/Ventes récentes:.*?\d+/gi, '');
  cleaned = cleaned.replace(/Recent sales:.*?\d+/gi, '');
  
  cleaned = cleaned.trim();

  return cleaned;
}
