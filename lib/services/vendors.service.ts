import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  address?: string;
  city?: string;
  country: string;
  rating: number;
  total_reviews: number;
  total_products: number;
  total_orders: number;
  commission_rate: number;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface VendorFilters {
  status?: 'active' | 'inactive' | 'pending';
  city?: string;
  country?: string;
  min_rating?: number;
  search?: string;
}

export interface CreateVendorData {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  address?: string;
  city?: string;
  country?: string;
  commission_rate?: number;
  status?: 'active' | 'inactive' | 'pending';
}

export interface UpdateVendorData extends Partial<CreateVendorData> {
  id: string;
}

export interface VendorStats {
  total_products: number;
  total_orders: number;
  total_revenue: number;
  average_rating: number;
  total_reviews: number;
  monthly_sales: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;
}

export class VendorsService extends BaseService {
  /**
   * Récupérer tous les vendeurs avec pagination
   */
  static async getAll(
    filters: VendorFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Vendor>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = this.getSupabaseClient()
        .from('vendors')
        .select('*', { count: 'exact' });

      // Appliquer les filtres
      if (filters.status) {
        query = query.eq('status', filters.status);
      } else {
        query = query.eq('status', 'active'); // Par défaut, seulement les vendeurs actifs
      }

      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      if (filters.country) {
        query = query.eq('country', filters.country);
      }

      if (filters.min_rating !== undefined) {
        query = query.gte('rating', filters.min_rating);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query
        .order('rating', { ascending: false })
        .order('name', { ascending: true })
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
   * Récupérer un vendeur par son slug
   */
  static async getBySlug(slug: string): Promise<ServiceResponse<Vendor | null>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('vendors')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer les vendeurs populaires (mieux notés)
   */
  static async getPopular(limit: number = 10): Promise<ServiceResponse<Vendor[]>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('vendors')
        .select('*')
        .eq('status', 'active')
        .gte('rating', 4.0)
        .order('rating', { ascending: false })
        .order('total_reviews', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Récupérer les nouveaux vendeurs
   */
  static async getNew(limit: number = 10): Promise<ServiceResponse<Vendor[]>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('vendors')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Rechercher des vendeurs
   */
  static async search(
    query: string,
    filters: VendorFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Vendor>> {
    return this.getAll(
      { ...filters, search: query },
      pagination
    );
  }

  /**
   * Récupérer les statistiques d'un vendeur
   */
  static async getStats(vendorId: string): Promise<ServiceResponse<VendorStats>> {
    try {
      // Pour l'instant, récupérer les stats de base depuis la table vendors
      const { data: vendor, error } = await this.getSupabaseClient()
        .from('vendors')
        .select('total_products, total_orders, rating, total_reviews')
        .eq('id', vendorId)
        .single();

      if (error) throw error;

      // Calculer le revenu total (approximatif)
      const { data: orderItems } = await this.getSupabaseClient()
        .from('order_items')
        .select('total')
        .eq('vendor_id', vendorId);

      const totalRevenue = orderItems?.reduce((sum, item) => sum + item.total, 0) || 0;

      const stats: VendorStats = {
        total_products: vendor.total_products,
        total_orders: vendor.total_orders,
        total_revenue: totalRevenue,
        average_rating: vendor.rating,
        total_reviews: vendor.total_reviews,
        monthly_sales: [] // À implémenter avec une requête plus complexe
      };

      return this.createResponse(stats);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Créer un nouveau vendeur
   */
  static async create(vendorData: CreateVendorData): Promise<ServiceResponse<Vendor | null>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('vendors')
        .insert([{
          ...vendorData,
          country: vendorData.country || 'BJ',
          commission_rate: vendorData.commission_rate || 10.00,
          status: vendorData.status || 'pending',
          rating: 0,
          total_reviews: 0,
          total_products: 0,
          total_orders: 0
        }])
        .select()
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Mettre à jour un vendeur
   */
  static async update(updateData: UpdateVendorData): Promise<ServiceResponse<Vendor | null>> {
    try {
      const { id, ...dataToUpdate } = updateData;
      
      const { data, error } = await this.getSupabaseClient()
        .from('vendors')
        .update({
          ...dataToUpdate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Supprimer un vendeur
   */
  static async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient()
        .from('vendors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Mettre à jour le statut d'un vendeur
   */
  static async updateStatus(
    id: string, 
    status: 'active' | 'inactive' | 'pending'
  ): Promise<ServiceResponse<Vendor | null>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('vendors')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Mettre à jour la note d'un vendeur
   */
  static async updateRating(id: string): Promise<ServiceResponse<Vendor | null>> {
    try {
      // Calculer la moyenne des notes des produits du vendeur
      const { data: products } = await this.getSupabaseClient()
        .from('products')
        .select(`
          product_reviews(rating)
        `)
        .eq('vendor_id', id)
        .eq('product_reviews.status', 'approved');

      let totalRating = 0;
      let reviewCount = 0;

      products?.forEach(product => {
        if (product.product_reviews) {
          product.product_reviews.forEach((review: any) => {
            totalRating += review.rating;
            reviewCount++;
          });
        }
      });

      const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

      const { data, error } = await this.getSupabaseClient()
        .from('vendors')
        .update({
          rating: Math.round(averageRating * 10) / 10, // Arrondir à 1 décimale
          total_reviews: reviewCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer les vendeurs par ville
   */
  static async getByCity(
    city: string,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Vendor>> {
    return this.getAll(
      { city, status: 'active' },
      pagination
    );
  }

  /**
   * Récupérer les vendeurs par pays
   */
  static async getByCountry(
    country: string,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Vendor>> {
    return this.getAll(
      { country, status: 'active' },
      pagination
    );
  }
}