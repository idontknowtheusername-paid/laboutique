import { BaseService, ServiceResponse } from './base.service';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // Relations
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_price?: number;
    images?: string[];
    status: string;
    quantity: number;
    track_quantity: boolean;
    vendor?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  items_count: number;
  currency: string;
}

export interface AddToCartData {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemData {
  id: string;
  quantity: number;
}

export class CartService extends BaseService {
  /**
   * Récupérer le panier d'un utilisateur
   */
  static async getByUser(userId: string): Promise<ServiceResponse<CartItem[]>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('cart_items')
        .select(`
          *,
          product:products (
            id,
            name,
            slug,
            price,
            compare_price,
            images,
            status,
            quantity,
            track_quantity,
            vendor:vendors (id, name, slug)
          )
        `)
        .eq('user_id', userId)
        .eq('products.status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Ajouter un produit au panier
   */
  static async addItem(userId: string, itemData: AddToCartData): Promise<ServiceResponse<CartItem>> {
    try {
      // Vérifier si le produit existe et est disponible
      const { data: product, error: productError } = await this.getSupabaseClient()
        .from('products')
        .select('id, status, quantity, track_quantity, price')
        .eq('id', itemData.product_id)
        .single();

      if (productError || !product) {
        return this.createResponse(null, 'Produit non trouvé');
      }

      if (product.status !== 'active') {
        return this.createResponse(null, 'Produit non disponible');
      }

      if (product.track_quantity && product.quantity < itemData.quantity) {
        return this.createResponse(null, `Stock insuffisant. Disponible: ${product.quantity}`);
      }

      // Vérifier si l'item existe déjà dans le panier
      const { data: existingItem } = await this.getSupabaseClient()
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', itemData.product_id)
        .single();

      if (existingItem) {
        // Mettre à jour la quantité
        const newQuantity = existingItem.quantity + itemData.quantity;
        
        if (product.track_quantity && product.quantity < newQuantity) {
          return this.createResponse(null, `Stock insuffisant. Disponible: ${product.quantity}, dans le panier: ${existingItem.quantity}`);
        }

        return this.updateItem(userId, { id: existingItem.id, quantity: newQuantity });
      }

      // Ajouter un nouvel item
      const { data, error } = await this.getSupabaseClient()
        .from('cart_items')
        .insert([{
          user_id: userId,
          product_id: itemData.product_id,
          quantity: itemData.quantity
        }])
        .select(`
          *,
          product:products (
            id,
            name,
            slug,
            price,
            compare_price,
            images,
            status,
            quantity,
            track_quantity,
            vendor:vendors (id, name, slug)
          )
        `)
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Mettre à jour la quantité d'un item du panier
   */
  static async updateItem(userId: string, updateData: UpdateCartItemData): Promise<ServiceResponse<CartItem>> {
    try {
      if (updateData.quantity <= 0) {
        return this.removeItem(userId, updateData.id);
      }

      // Récupérer l'item actuel pour vérifier le stock
      const { data: cartItem, error: cartError } = await this.getSupabaseClient()
        .from('cart_items')
        .select(`
          *,
          product:products (id, quantity, track_quantity, status)
        `)
        .eq('id', updateData.id)
        .eq('user_id', userId)
        .single();

      if (cartError || !cartItem) {
        return this.createResponse(null, 'Item du panier non trouvé');
      }

      if (cartItem.product.status !== 'active') {
        return this.createResponse(null, 'Produit non disponible');
      }

      if (cartItem.product.track_quantity && cartItem.product.quantity < updateData.quantity) {
        return this.createResponse(null, `Stock insuffisant. Disponible: ${cartItem.product.quantity}`);
      }

      // Mettre à jour la quantité
      const { data, error } = await this.getSupabaseClient()
        .from('cart_items')
        .update({
          quantity: updateData.quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', updateData.id)
        .eq('user_id', userId)
        .select(`
          *,
          product:products (
            id,
            name,
            slug,
            price,
            compare_price,
            images,
            status,
            quantity,
            track_quantity,
            vendor:vendors (id, name, slug)
          )
        `)
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Supprimer un item du panier
   */
  static async removeItem(userId: string, itemId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient()
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Vider complètement le panier
   */
  static async clearCart(userId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient()
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Récupérer le résumé du panier avec calculs
   */
  static async getCartSummary(userId: string): Promise<ServiceResponse<CartSummary>> {
    try {
      const cartResponse = await this.getByUser(userId);
      
      if (!cartResponse.success || !cartResponse.data) {
        return this.createResponse(null, cartResponse.error);
      }

      const items = cartResponse.data;
      const subtotal = items.reduce((sum, item) => {
        return sum + (item.product?.price || 0) * item.quantity;
      }, 0);

      const taxRate = 0.18; // 18% TVA
      const taxAmount = subtotal * taxRate;
      
      // Frais de livraison (logique à personnaliser)
      const shippingAmount = subtotal > 50000 ? 0 : 2000; // Livraison gratuite au-dessus de 50 000 FCFA
      
      const discountAmount = 0; // À implémenter avec les coupons
      const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;
      
      const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

      const summary: CartSummary = {
        items,
        subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        items_count: itemsCount,
        currency: 'XOF'
      };

      return this.createResponse(summary);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Obtenir le nombre d'items dans le panier
   */
  static async getItemsCount(userId: string): Promise<ServiceResponse<number>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('cart_items')
        .select('quantity')
        .eq('user_id', userId);

      if (error) throw error;

      const count = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      return this.createResponse(count);
    } catch (error) {
      return this.createResponse(0, this.handleError(error));
    }
  }

  /**
   * Valider la disponibilité de tous les items du panier
   */
  static async validateCart(userId: string): Promise<ServiceResponse<{
    valid: boolean;
    issues: Array<{
      itemId: string;
      productName: string;
      issue: string;
      availableQuantity?: number;
    }>;
  }>> {
    try {
      const cartResponse = await this.getByUser(userId);
      
      if (!cartResponse.success || !cartResponse.data) {
        return this.createResponse({ valid: false, issues: [] }, cartResponse.error);
      }

      const issues: Array<{
        itemId: string;
        productName: string;
        issue: string;
        availableQuantity?: number;
      }> = [];

      for (const item of cartResponse.data) {
        if (!item.product) {
          issues.push({
            itemId: item.id,
            productName: 'Produit inconnu',
            issue: 'Produit non trouvé'
          });
          continue;
        }

        if (item.product.status !== 'active') {
          issues.push({
            itemId: item.id,
            productName: item.product.name,
            issue: 'Produit non disponible'
          });
          continue;
        }

        if (item.product.track_quantity && item.product.quantity < item.quantity) {
          issues.push({
            itemId: item.id,
            productName: item.product.name,
            issue: 'Stock insuffisant',
            availableQuantity: item.product.quantity
          });
        }
      }

      return this.createResponse({
        valid: issues.length === 0,
        issues
      });
    } catch (error) {
      return this.createResponse(
        { valid: false, issues: [] },
        this.handleError(error)
      );
    }
  }

  /**
   * Déplacer des items du panier vers la wishlist
   */
  static async moveToWishlist(
    userId: string,
    itemIds: string[]
  ): Promise<ServiceResponse<{ moved: number; errors: string[] }>> {
    try {
      const results = { moved: 0, errors: [] as string[] };

      for (const itemId of itemIds) {
        try {
          // Récupérer l'item du panier
          const { data: cartItem, error: cartError } = await this.getSupabaseClient()
            .from('cart_items')
            .select('product_id')
            .eq('id', itemId)
            .eq('user_id', userId)
            .single();

          if (cartError || !cartItem) {
            results.errors.push(`Item ${itemId} non trouvé`);
            continue;
          }

          // Ajouter à la wishlist
          const { error: wishlistError } = await this.getSupabaseClient()
            .from('wishlist')
            .upsert({
              user_id: userId,
              product_id: cartItem.product_id
            }, {
              onConflict: 'user_id,product_id'
            });

          if (wishlistError) {
            results.errors.push(`Erreur ajout wishlist pour item ${itemId}`);
            continue;
          }

          // Supprimer du panier
          await this.removeItem(userId, itemId);
          results.moved++;

        } catch (error) {
          results.errors.push(`Erreur item ${itemId}: ${this.handleError(error)}`);
        }
      }

      return this.createResponse(results);
    } catch (error) {
      return this.createResponse(
        { moved: 0, errors: [this.handleError(error)] },
        this.handleError(error)
      );
    }
  }

  /**
   * Appliquer un coupon de réduction
   */
  static async applyCoupon(
    userId: string,
    couponCode: string
  ): Promise<ServiceResponse<{ discountAmount: number; couponId: string }>> {
    try {
      // Récupérer le coupon
      const { data: coupon, error: couponError } = await this.getSupabaseClient()
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('status', 'active')
        .single();

      if (couponError || !coupon) {
        return this.createResponse(null, 'Coupon invalide ou expiré');
      }

      // Vérifier la validité du coupon
      const now = new Date();
      if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        return this.createResponse(null, 'Ce coupon n\'est pas encore valide');
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        return this.createResponse(null, 'Ce coupon a expiré');
      }

      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return this.createResponse(null, 'Ce coupon a atteint sa limite d\'utilisation');
      }

      // Récupérer le résumé du panier
      const summaryResponse = await this.getCartSummary(userId);
      if (!summaryResponse.success || !summaryResponse.data) {
        return this.createResponse(null, 'Erreur lors du calcul du panier');
      }

      const { subtotal } = summaryResponse.data;

      // Vérifier le montant minimum
      if (coupon.minimum_amount && subtotal < coupon.minimum_amount) {
        return this.createResponse(null, `Montant minimum requis: ${coupon.minimum_amount} FCFA`);
      }

      // Calculer la réduction
      let discountAmount = 0;
      if (coupon.type === 'percentage') {
        discountAmount = (subtotal * coupon.value) / 100;
      } else if (coupon.type === 'fixed') {
        discountAmount = coupon.value;
      }

      // Appliquer le montant maximum si défini
      if (coupon.maximum_amount && discountAmount > coupon.maximum_amount) {
        discountAmount = coupon.maximum_amount;
      }

      // S'assurer que la réduction ne dépasse pas le sous-total
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }

      return this.createResponse({
        discountAmount,
        couponId: coupon.id
      });
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }
}