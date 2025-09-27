import { z } from 'zod';

// Schéma de validation pour les données importées d'AliExpress/AliBaba
export const importedProductSchema = z.object({
  // Informations de base
  name: z.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères'),
  
  description: z.string()
    .min(20, 'La description doit contenir au moins 20 caractères')
    .max(5000, 'La description ne peut pas dépasser 5000 caractères'),
  
  short_description: z.string()
    .max(200, 'La description courte ne peut pas dépasser 200 caractères')
    .optional(),

  // Prix et stock
  price: z.number()
    .positive('Le prix doit être positif')
    .min(0.01, 'Le prix minimum est de 0.01')
    .max(999999.99, 'Le prix maximum est de 999999.99'),
  
  original_price: z.number()
    .positive('Le prix original doit être positif')
    .min(0.01, 'Le prix minimum est de 0.01')
    .max(999999.99, 'Le prix maximum est de 999999.99'),
  
  stock_quantity: z.number()
    .int('La quantité doit être un nombre entier')
    .min(0, 'La quantité ne peut pas être négative')
    .default(0),

  // Images
  images: z.array(
    z.string()
      .min(1, 'L\'URL de l\'image ne peut pas être vide')
      .refine(url => {
        // Accepter les URLs HTTP/HTTPS, les chemins relatifs et absolus
        return url.startsWith('http://') || 
               url.startsWith('https://') || 
               url.startsWith('/') || 
               url.startsWith('./') ||
               url.match(/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|gif|webp)$/i);
      }, 'L\'URL de l\'image doit être valide (HTTP/HTTPS, chemin relatif ou nom de fichier)')
  ).min(1, 'Au moins une image est requise')
    .max(10, 'Maximum 10 images par produit'),

  // Identifiants et métadonnées
  sku: z.string()
    .min(3, 'Le SKU doit contenir au moins 3 caractères')
    .max(50, 'Le SKU ne peut pas dépasser 50 caractères')
    .regex(/^[A-Za-z0-9-_]+$/, 'Le SKU ne peut contenir que des lettres, chiffres, tirets et underscores'),
  
  source_platform: z.enum(['aliexpress', 'alibaba']),
  
  source_url: z.string()
    .url('L\'URL source n\'est pas valide')
    .refine(
      url => url.includes('aliexpress.com') || url.includes('alibaba.com'),
      'L\'URL doit provenir d\'AliExpress ou AliBaba'
    ),

  // Catégorie (optionnelle au départ, sera gérée dans la prochaine amélioration)
  category_id: z.string().optional(),

  // Dimensions et poids pour la livraison
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    weight: z.number().positive().optional(),
    unit: z.enum(['cm', 'mm', 'in']).optional(),
    weight_unit: z.enum(['kg', 'g', 'lb', 'oz']).optional(),
  }).optional(),

  // Variantes (pour une future implémentation)
  has_variants: z.boolean().default(false),
  variants: z.array(z.object({
    name: z.string(),
    values: z.array(z.string())
  })).optional(),
});

export type ImportedProductData = z.infer<typeof importedProductSchema>;

// Fonction utilitaire pour valider les données
export async function validateImportedProduct(data: any): Promise<{
  success: boolean;
  data?: ImportedProductData;
  errors?: z.ZodError;
}> {
  try {
    const validatedData = await importedProductSchema.parseAsync(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}