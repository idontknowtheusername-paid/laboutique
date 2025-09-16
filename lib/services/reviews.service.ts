import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  verified_purchase: boolean;
  helpful_count: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  // Relations
  user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
    images?: string[];
  };
}

export interface ReviewFilters {
  product_id?: string;
  user_id?: string;
  rating?: number;
  min_rating?: number;
  max_rating?: number;
  status?: 'pending' | 'approved' | 'rejected';
  verified_purchase?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface CreateReviewData {
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
}

export interface UpdateReviewData {
  id: string;
  rating?: number;
  title?: string;
  content?: string;
  images?: string[];
  status?: 'pending' | 'approved' | 'rejected';
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  verified_purchases_count: number;
  pending_reviews: number;
}

export class ReviewsService extends BaseService {
  /**
   * Récupérer tous les avis avec pagination
   */
  static async getAll(
    filters: ReviewFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<ProductReview>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = this.getSupabaseClient()
        .from('product_reviews')
        .select(`
          *,
          user:profiles (id, first_name, last_name, avatar_url),
          product:products (id, name, slug, images)
        `, { count: 'exact' });

      // Appliquer les filtres
      if (filters.product_id) {
        query = query.eq('product_id', filters.product_id);
      }

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.rating) {
        query = query.eq('rating', filters.rating);
      }

      if (filters.min_rating !== undefined) {
        query = query.gte('rating', filters.min_rating);
      }

      if (filters.max_rating !== undefined) {
        query = query.lte('rating', filters.max_rating);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      } else {
        query = query.eq('status', 'approved'); // Par défaut, seulement les avis approuvés
      }

      if (filters.verified_purchase !== undefined) {
        query = query.eq('verified_purchase', filters.verified_purchase);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

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
   * Récupérer les avis d'un produit
   */
  static async getByProduct(
    productId: string,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<ProductReview>> {
    return this.getAll(
      { product_id: productId, status: 'approved' },
      pagination
    );
  }

  /**
   * Récupérer les avis d'un utilisateur
   */
  static async getByUser(
    userId: string,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<ProductReview>> {
    return this.getAll(
      { user_id: userId },
      pagination
    );
  }

  /**
   * Récupérer un avis par son ID
   */
  static async getById(id: string): Promise<ServiceResponse<ProductReview | null>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('product_reviews')
        .select(`
          *,
          user:profiles (id, first_name, last_name, avatar_url),
          product:products (id, name, slug, images)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Créer un nouvel avis
   */
  static async create(reviewData: CreateReviewData): Promise<ServiceResponse<ProductReview | null>> {
    try {
      // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
      const { data: existingReview } = await this.getSupabaseClient()
        .from('product_reviews')
        .select('id')
        .eq('user_id', reviewData.user_id)
        .eq('product_id', reviewData.product_id)
        .single();

      if (existingReview) {
        return this.createResponse(null, 'Vous avez déjà laissé un avis pour ce produit');
      }

      // Vérifier si l'utilisateur a acheté le produit
      const { data: purchase } = await this.getSupabaseClient()
        .from('order_items')
        .select(`
          id,
          order:orders!inner (user_id, status)
        `)
        .eq('product_id', reviewData.product_id)
        .eq('orders.user_id', reviewData.user_id)
        .eq('orders.status', 'delivered')
        .single();

      const verifiedPurchase = !!purchase;

      // Créer l'avis
      const { data, error } = await (this.getSupabaseClient() as any)
        .from('product_reviews')
        .insert([{
          ...reviewData,
          verified_purchase: verifiedPurchase,
          helpful_count: 0,
          status: 'pending' // Les avis doivent être modérés
        }])
        .select(`
          *,
          user:profiles (id, first_name, last_name, avatar_url),
          product:products (id, name, slug, images)
        `)
        .single();

      if (error) throw error;

      // Mettre à jour la note moyenne du produit
      await this.updateProductRating(reviewData.product_id);

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Mettre à jour un avis
   */
  static async update(updateData: UpdateReviewData): Promise<ServiceResponse<ProductReview | null>> {
    try {
      const { id, ...dataToUpdate } = updateData;
      
      const { data, error } = await (this.getSupabaseClient() as any)
        .from('product_reviews')
        .update({
          ...dataToUpdate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          user:profiles (id, first_name, last_name, avatar_url),
          product:products (id, name, slug, images)
        `)
        .single();

      if (error) throw error;

      // Mettre à jour la note moyenne du produit si la note a changé
      if (dataToUpdate.rating !== undefined) {
        await this.updateProductRating(data.product_id);
      }

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Supprimer un avis
   */
  static async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      // Récupérer l'avis pour connaître le produit
      const { data: review } = await this.getSupabaseClient()
        .from('product_reviews')
        .select('product_id')
        .eq('id', id)
        .single();

      const { error } = await this.getSupabaseClient()
        .from('product_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Mettre à jour la note moyenne du produit
      if (review) {
        await this.updateProductRating(review.product_id);
      }

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Approuver un avis
   */
  static async approve(id: string): Promise<ServiceResponse<ProductReview>> {
    return this.update({ id, status: 'approved' });
  }

  /**
   * Rejeter un avis
   */
  static async reject(id: string): Promise<ServiceResponse<ProductReview>> {
    return this.update({ id, status: 'rejected' });
  }

  /**
   * Marquer un avis comme utile
   */
  static async markHelpful(id: string): Promise<ServiceResponse<ProductReview>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .rpc('increment_review_helpful', { review_id: id });

      if (error) throw error;

      return this.getById(id);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer les statistiques des avis d'un produit
   */
  static async getProductStats(productId: string): Promise<ServiceResponse<ReviewStats>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .rpc('get_product_review_stats', { product_id: productId });

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer les avis récents
   */
  static async getRecent(limit: number = 10): Promise<ServiceResponse<ProductReview[]>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('product_reviews')
        .select(`
          *,
          user:profiles (id, first_name, last_name, avatar_url),
          product:products (id, name, slug, images)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer les meilleurs avis (les mieux notés et les plus utiles)
   */
  static async getTopRated(
    productId?: string,
    limit: number = 10
  ): Promise<ServiceResponse<ProductReview[]>> {
    try {
      let query = this.getSupabaseClient()
        .from('product_reviews')
        .select(`
          *,
          user:profiles (id, first_name, last_name, avatar_url),
          product:products (id, name, slug, images)
        `)
        .eq('status', 'approved')
        .gte('rating', 4);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query
        .order('helpful_count', { ascending: false })
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Vérifier si un utilisateur peut laisser un avis pour un produit
   */
  static async canUserReview(userId: string, productId: string): Promise<ServiceResponse<{
    canReview: boolean;
    reason?: string;
    hasPurchased: boolean;
    hasReviewed: boolean;
  }>> {
    try {
      // Vérifier si l'utilisateur a déjà laissé un avis
      const { data: existingReview } = await this.getSupabaseClient()
        .from('product_reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      const hasReviewed = !!existingReview;

      // Vérifier si l'utilisateur a acheté le produit
      const { data: purchase } = await this.getSupabaseClient()
        .from('order_items')
        .select(`
          id,
          order:orders!inner (user_id, status)
        `)
        .eq('product_id', productId)
        .eq('orders.user_id', userId)
        .eq('orders.status', 'delivered')
        .single();

      const hasPurchased = !!purchase;

      let canReview = true;
      let reason: string | undefined;

      if (hasReviewed) {
        canReview = false;
        reason = 'Vous avez déjà laissé un avis pour ce produit';
      } else if (!hasPurchased) {
        canReview = false;
        reason = 'Vous devez acheter ce produit pour laisser un avis';
      }

      return this.createResponse({
        canReview,
        reason,
        hasPurchased,
        hasReviewed
      });
    } catch (error) {
      return this.createResponse({
        canReview: false,
        reason: this.handleError(error),
        hasPurchased: false,
        hasReviewed: false
      });
    }
  }

  /**
   * Mettre à jour la note moyenne d'un produit
   */
  private static async updateProductRating(productId: string): Promise<void> {
    try {
      await this.getSupabaseClient()
        .rpc('update_product_rating', { product_id: productId });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note du produit:', error);
    }
  }

  /**
   * Rechercher dans les avis
   */
  static async search(
    query: string,
    filters: ReviewFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<ProductReview>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let supabaseQuery = this.getSupabaseClient()
        .from('product_reviews')
        .select(`
          *,
          user:profiles (id, first_name, last_name, avatar_url),
          product:products (id, name, slug, images)
        `, { count: 'exact' })
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`);

      // Appliquer les autres filtres
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          supabaseQuery = supabaseQuery.eq(key, value);
        }
      });

      const { data, error, count } = await supabaseQuery
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
}