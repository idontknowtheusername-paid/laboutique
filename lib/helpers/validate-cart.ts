import { supabaseAdmin } from '@/lib/supabase-server';

/**
 * Interface pour un item de panier
 */
export interface CartItem {
  product_id: string;
  quantity: number;
  price: number; // Prix envoyé par le client (NON FIABLE)
}

/**
 * Interface pour un item validé
 */
export interface ValidatedCartItem {
  product_id: string;
  vendor_id: string;
  quantity: number;
  price: number; // Prix RÉEL depuis la DB
  total: number;
  product_name?: string;
}

/**
 * Valider et recalculer les prix depuis la base de données
 * ⚠️ CRITIQUE : Ne jamais faire confiance aux prix côté client !
 */
export async function validateCartItems(
  items: CartItem[]
): Promise<{ success: boolean; items?: ValidatedCartItem[]; error?: string }> {
  try {
    if (!items || items.length === 0) {
      return { success: false, error: 'Panier vide' };
    }

    const validatedItems: ValidatedCartItem[] = [];

    // Valider chaque produit un par un
    for (const item of items) {
      // Récupérer le produit depuis la DB avec son prix RÉEL
      const { data: productData, error } = await (supabaseAdmin as any)
        .from('products')
        .select('id, name, price, vendor_id, status, quantity, track_quantity')
        .eq('id', item.product_id)
        .single();

      const product = productData as any;

      if (error || !product) {
        console.error('[ValidateCart] Produit non trouvé:', item.product_id, error);
        return { 
          success: false, 
          error: `Produit ${item.product_id} non trouvé ou indisponible` 
        };
      }

      // Vérifier que le produit est actif
      if (product.status !== 'active') {
        return { 
          success: false, 
          error: `Le produit "${product.name}" n'est plus disponible` 
        };
      }

      // Vérifier le stock si tracking activé
      if (product.track_quantity && product.quantity < item.quantity) {
        return { 
          success: false, 
          error: `Stock insuffisant pour "${product.name}". Disponible: ${product.quantity}` 
        };
      }

      // Vérifier que la quantité est valide
      if (item.quantity <= 0 || item.quantity > 999) {
        return { 
          success: false, 
          error: `Quantité invalide pour "${product.name}"` 
        };
      }

      // ✅ UTILISER LE PRIX RÉEL DEPUIS LA DB, PAS CELUI DU CLIENT !
      const realPrice = product.price;
      
      // Log si le prix du client est différent (tentative de fraude potentielle)
      if (Math.abs(item.price - realPrice) > 0.01) {
        console.warn(
          '⚠️ [ValidateCart] Prix suspect détecté !',
          `Produit: ${product.name}`,
          `Prix client: ${item.price}`,
          `Prix réel: ${realPrice}`
        );
      }

      validatedItems.push({
        product_id: product.id,
        vendor_id: product.vendor_id || 'default',
        quantity: item.quantity,
        price: realPrice, // ✅ Prix RÉEL depuis la DB
        total: realPrice * item.quantity,
        product_name: product.name
      });
    }

    console.log('[ValidateCart] ✅ Validation réussie:', validatedItems.length, 'produits');
    
    return { success: true, items: validatedItems };

  } catch (error: any) {
    console.error('[ValidateCart] Erreur validation:', error);
    return { 
      success: false, 
      error: 'Erreur lors de la validation du panier' 
    };
  }
}

/**
 * Calculer le total d'une commande avec frais de livraison
 */
export function calculateOrderTotal(
  validatedItems: ValidatedCartItem[],
  shippingThreshold: number = 50000,
  shippingCost: number = 2000
): { subtotal: number; shipping: number; total: number } {
  const subtotal = validatedItems.reduce((sum, item) => sum + item.total, 0);
  const shipping = subtotal >= shippingThreshold ? 0 : shippingCost;
  const total = subtotal + shipping;

  return { subtotal, shipping, total };
}
