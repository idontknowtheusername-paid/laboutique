import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  // Relations
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_price?: number;
    images?: string[];
    status: string;
    vendor?: {
      id: string;
      name: string;
      slug: string;
    };
    category?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export interface WishlistFilters {
  user_id?: string;
  category_id?: string;
  vendor_id?: string;
  price_min?: number;
  price_max?: number;
  in_stock?: boolean;
}

export class WishlistService extends BaseService {
  /**
   * Récupérer tous les items de la wishlist d'un utilisateur
   */
  static async getByUser(
    userId: string,
    filters: Omit<WishlistFilters, 'user_id'> = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<WishlistItem>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = this.getSupabaseClient()
        .from('wishlist')
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
            vendor:vendors (id, name, slug),
            category:categories (id, name, slug)
          )
        `, { count: 'exact' })
        .eq('user_id', userId);

      // Appliquer les filtres
      if (filters.category_id) {
        query = query.eq('products.category_id', filters.category_id);
      }

      if (filters.vendor_id) {
        query = query.eq('products.vendor_id', filters.vendor_id);
      }

      if (filters.price_min !== undefined) {
        query = query.gte('products.price', filters.price_min);
      }

      if (filters.price_max !== undefined) {
        query = query.lte('products.price', filters.price_max);
      }

      if (filters.in_stock) {
        query = query.gt('products.quantity', 0);
      }

      // Filtrer seulement les produits actifs
      query = query.eq('products.status', 'active');

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const paginationInfo = this.calculatePagination(page, limit, total);

      return this.createPaginatedResponse(data || [], paginationInfo);
    } catch (error) {
      return this.createPaginatedResponse([], {
        page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false
      }, this.handleError(error));
    }
  }

  /**
   * Ajouter un produit à la wishlist
   */
  static async addItem(userId: string, productId: string): Promise<ServiceResponse<WishlistItem>> {
    try {
      // Vérifier si le produit existe et est actif
      const { data: product, error: productError } = await this.getSupabaseClient()
        .from('products')
        .select('id, status')
        .eq('id', productId)
        .eq('status', 'active')
        .single();

      if (productError || !product) {
        return this.createResponse(null, 'Produit non trouvé ou inactif');
      }

      // Vérifier si l'item n'existe pas déjà
      const { data: existing } = await this.getSupabaseClient()
        .from('wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existing) {
        return this.createResponse(null, 'Ce produit est déjà dans votre wishlist');
      }

      // Ajouter l'item
      const { data, error } = await this.getSupabaseClient()
        .from('wishlist')
        .insert([{
          user_id: userId,
          product_id: productId
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
            vendor:vendors (id, name, slug),
            category:categories (id, name, slug)
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
   * Supprimer un produit de la wishlist
   */
  static async removeItem(userId: string, productId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient()
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Supprimer un item par son ID
   */
  static async removeById(userId: string, itemId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient()
        .from('wishlist')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId); // Sécurité: s'assurer que l'utilisateur possède cet item

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Vider complètement la wishlist d'un utilisateur
   */
  static async clearAll(userId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient()
        .from('wishlist')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Vérifier si un produit est dans la wishlist
   */
  static async isInWishlist(userId: string, productId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return this.createResponse(!!data);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Obtenir le nombre d'items dans la wishlist
   */
  static async getCount(userId: string): Promise<ServiceResponse<number>> {
    try {
      const { count, error } = await this.getSupabaseClient()
        .from('wishlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      return this.createResponse(count || 0);
    } catch (error) {
      return this.createResponse(0, this.handleError(error));
    }
  }

  /**
   * Déplacer des items de la wishlist vers le panier
   */
  static async moveToCart(
    userId: string,
    itemIds: string[]
  ): Promise<ServiceResponse<{ moved: number; errors: string[] }>> {
    try {
      const results = { moved: 0, errors: [] as string[] };

      for (const itemId of itemIds) {
        try {
          // Récupérer l'item de wishlist
          const { data: wishlistItem, error: wishlistError } = await this.getSupabaseClient()
            .from('wishlist')
            .select(`
              *,
              product:products (id, name, price, quantity, status)
            `)
            .eq('id', itemId)
            .eq('user_id', userId)
            .single();

          if (wishlistError || !wishlistItem) {
            results.errors.push(`Item ${itemId} non trouvé`);
            continue;
          }

          // Vérifier la disponibilité du produit
          if (wishlistItem.product.status !== 'active' || wishlistItem.product.quantity <= 0) {
            results.errors.push(`Produit ${wishlistItem.product.name} non disponible`);
            continue;
          }

          // Ajouter au panier (ou mettre à jour la quantité)
          const { error: cartError } = await this.getSupabaseClient()
            .from('cart_items')
            .upsert({
              user_id: userId,
              product_id: wishlistItem.product_id,
              quantity: 1
            }, {
              onConflict: 'user_id,product_id'
            });

          if (cartError) {
            results.errors.push(`Erreur ajout panier: ${wishlistItem.product.name}`);
            continue;
          }

          // Supprimer de la wishlist
          await this.removeById(userId, itemId);
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
   * Récupérer les produits similaires basés sur la wishlist
   */
  static async getSimilarProducts(
    userId: string,
    limit: number = 10
  ): Promise<ServiceResponse<any[]>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .rpc('get_wishlist_recommendations', {
          user_id: userId,
          limit_count: limit
        });

      if (error) throw error;

      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Partager la wishlist (générer un lien de partage)
   */
  static async shareWishlist(userId: string): Promise<ServiceResponse<{ shareUrl: string; expiresAt: string }>> {
    try {
      // Générer un token de partage temporaire
      const shareToken = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours

      // Sauvegarder le token (vous pourriez créer une table share_tokens)
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/wishlist/shared/${shareToken}`;

      return this.createResponse({
        shareUrl,
        expiresAt: expiresAt.toISOString()
      });
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer les statistiques de la wishlist
   */
  static async getStats(userId: string): Promise<ServiceResponse<{
    totalItems: number;
    totalValue: number;
    categoriesCount: number;
    vendorsCount: number;
    availableItems: number;
    unavailableItems: number;
  }>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .rpc('get_wishlist_stats', { user_id: userId });

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }
}