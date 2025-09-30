import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';
import { isSupabaseConfigured } from '@/lib/supabase';

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  min_amount?: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  status: 'active' | 'inactive' | 'expired';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Relations
  created_by_user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface CouponFilters {
  status?: 'active' | 'inactive' | 'expired';
  type?: 'percentage' | 'fixed' | 'free_shipping';
  search?: string;
  created_by?: string;
}

export interface CreateCouponData {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  min_amount?: number;
  max_discount?: number;
  usage_limit?: number;
  status?: 'active' | 'inactive';
  start_date: string;
  end_date: string;
}

export interface UpdateCouponData extends Partial<CreateCouponData> {
  id: string;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  user_id: string;
  order_id: string;
  discount_amount: number;
  used_at: string;
  // Relations
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  order?: {
    id: string;
    order_number: string;
    total_amount: number;
  };
}

export interface CouponStats {
  total_coupons: number;
  active_coupons: number;
  total_usage: number;
  total_discount: number;
  average_usage_rate: number;
}

export class CouponsService extends BaseService {
  /**
   * Récupérer tous les coupons avec pagination et filtres
   */
  static async getAll(
    filters: CouponFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Coupon>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createPaginatedResponse([], { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false }, 'Supabase non configuré');
      }

      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = this.getSupabaseClient()
        .from('coupons')
        .select(`
          id,
          code,
          name,
          description,
          type,
          value,
          min_amount,
          max_discount,
          usage_limit,
          used_count,
          status,
          start_date,
          end_date,
          created_at,
          updated_at,
          created_by
        `, { count: 'exact' });

      // Appliquer les filtres
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.created_by) {
        query = query.eq('created_by', filters.created_by);
      }

      if (filters.search) {
        query = query.or(`code.ilike.%${filters.search}%,name.ilike.%${filters.search}%`);
      }

      // Trier par date de création
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query
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
   * Récupérer un coupon par son code
   */
  static async getByCode(code: string): Promise<ServiceResponse<Coupon | null>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(null, 'Supabase non configuré');
      }

      const { data, error } = await this.getSupabaseClient()
        .from('coupons')
        .select(`
          id,
          code,
          name,
          description,
          type,
          value,
          min_amount,
          max_discount,
          usage_limit,
          used_count,
          status,
          start_date,
          end_date,
          created_at,
          updated_at
        `)
        .eq('code', code.toUpperCase())
        .eq('status', 'active')
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Créer un nouveau coupon
   */
  static async create(couponData: CreateCouponData): Promise<ServiceResponse<Coupon | null>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(null, 'Supabase non configuré');
      }

      // Vérifier que le code n'existe pas déjà
      const existingCoupon = await this.getByCode(couponData.code);
      if (existingCoupon.success && existingCoupon.data) {
        return this.createResponse(null, 'Un coupon avec ce code existe déjà');
      }

      const { data, error } = await this.getSupabaseClient()
        .from('coupons')
        .insert([{
          ...couponData,
          code: couponData.code.toUpperCase(),
          used_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          id,
          code,
          name,
          description,
          type,
          value,
          min_amount,
          max_discount,
          usage_limit,
          used_count,
          status,
          start_date,
          end_date,
          created_at,
          updated_at,
          created_by
        `)
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Mettre à jour un coupon
   */
  static async update(updateData: UpdateCouponData): Promise<ServiceResponse<Coupon | null>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(null, 'Supabase non configuré');
      }

      const { id, ...dataToUpdate } = updateData;

      const { data, error } = await this.getSupabaseClient()
        .from('coupons')
        .update({
          ...dataToUpdate,
          code: dataToUpdate.code?.toUpperCase(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          id,
          code,
          name,
          description,
          type,
          value,
          min_amount,
          max_discount,
          usage_limit,
          used_count,
          status,
          start_date,
          end_date,
          created_at,
          updated_at,
          created_by
        `)
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Supprimer un coupon
   */
  static async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(false, 'Supabase non configuré');
      }

      const { error } = await this.getSupabaseClient()
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Utiliser un coupon
   */
  static async useCoupon(
    code: string, 
    userId: string, 
    orderId: string, 
    orderAmount: number
  ): Promise<ServiceResponse<{ discount: number; finalAmount: number }>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse({ discount: 0, finalAmount: orderAmount }, 'Supabase non configuré');
      }

      // Récupérer le coupon
      const couponResponse = await this.getByCode(code);
      if (!couponResponse.success || !couponResponse.data) {
        return this.createResponse({ discount: 0, finalAmount: orderAmount }, 'Coupon non trouvé ou inactif');
      }

      const coupon = couponResponse.data;

      // Vérifier les conditions
      const now = new Date();
      const startDate = new Date(coupon.start_date);
      const endDate = new Date(coupon.end_date);

      if (now < startDate || now > endDate) {
        return this.createResponse({ discount: 0, finalAmount: orderAmount }, 'Coupon expiré ou pas encore valide');
      }

      if (coupon.min_amount && orderAmount < coupon.min_amount) {
        return this.createResponse({ discount: 0, finalAmount: orderAmount }, `Montant minimum requis: ${coupon.min_amount} FCFA`);
      }

      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return this.createResponse({ discount: 0, finalAmount: orderAmount }, 'Limite d\'utilisation atteinte');
      }

      // Calculer la réduction
      let discount = 0;
      switch (coupon.type) {
        case 'percentage':
          discount = (orderAmount * coupon.value) / 100;
          if (coupon.max_discount) {
            discount = Math.min(discount, coupon.max_discount);
          }
          break;
        case 'fixed':
          discount = coupon.value;
          break;
        case 'free_shipping':
          // Pour la livraison gratuite, on retourne 0 car c'est géré côté commande
          discount = 0;
          break;
      }

      const finalAmount = Math.max(0, orderAmount - discount);

      // Enregistrer l'utilisation
      const { error: usageError } = await this.getSupabaseClient()
        .from('coupon_usage')
        .insert([{
          coupon_id: coupon.id,
          user_id: userId,
          order_id: orderId,
          discount_amount: discount,
          used_at: new Date().toISOString()
        }]);

      if (usageError) throw usageError;

      // Mettre à jour le compteur d'utilisation
      const { error: updateError } = await this.getSupabaseClient()
        .from('coupons')
        .update({ 
          used_count: coupon.used_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', coupon.id);

      if (updateError) throw updateError;

      return this.createResponse({ discount, finalAmount });
    } catch (error) {
      return this.createResponse({ discount: 0, finalAmount: orderAmount }, this.handleError(error));
    }
  }

  /**
   * Récupérer l'historique d'utilisation d'un coupon
   */
  static async getUsageHistory(
    couponId: string,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<CouponUsage>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createPaginatedResponse([], { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false }, 'Supabase non configuré');
      }

      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      const { data, error, count } = await this.getSupabaseClient()
        .from('coupon_usage')
        .select(`
          id,
          coupon_id,
          user_id,
          order_id,
          discount_amount,
          used_at,
          user:profiles!coupon_usage_user_id_fkey(
            id,
            email,
            first_name,
            last_name
          ),
          order:orders!coupon_usage_order_id_fkey(
            id,
            order_number,
            total_amount
          )
        `, { count: 'exact' })
        .eq('coupon_id', couponId)
        .order('used_at', { ascending: false })
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
   * Obtenir les statistiques des coupons
   */
  static async getStats(): Promise<ServiceResponse<CouponStats>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse({
          total_coupons: 0,
          active_coupons: 0,
          total_usage: 0,
          total_discount: 0,
          average_usage_rate: 0
        }, 'Supabase non configuré');
      }

      // Récupérer les statistiques des coupons
      const { data: coupons, error: couponsError } = await this.getSupabaseClient()
        .from('coupons')
        .select('id, status, used_count, usage_limit');

      if (couponsError) throw couponsError;

      // Récupérer les statistiques d'utilisation
      const { data: usage, error: usageError } = await this.getSupabaseClient()
        .from('coupon_usage')
        .select('discount_amount');

      if (usageError) throw usageError;

      const totalCoupons = coupons?.length || 0;
      const activeCoupons = coupons?.filter((c: any) => c.status === 'active').length || 0;
      const totalUsage = coupons?.reduce((sum: any, c: any) => sum + (c.used_count || 0), 0) || 0;
      const totalDiscount = usage?.reduce((sum: any, u: any) => sum + (u.discount_amount || 0), 0) || 0;

      const totalLimits = coupons?.reduce((sum: any, c: any) => sum + (c.usage_limit || 0), 0) || 0;
      const averageUsageRate = totalLimits > 0 ? (totalUsage / totalLimits) * 100 : 0;

      return this.createResponse({
        total_coupons: totalCoupons,
        active_coupons: activeCoupons,
        total_usage: totalUsage,
        total_discount: totalDiscount,
        average_usage_rate: averageUsageRate
      });
    } catch (error) {
      return this.createResponse({
        total_coupons: 0,
        active_coupons: 0,
        total_usage: 0,
        total_discount: 0,
        average_usage_rate: 0
      }, this.handleError(error));
    }
  }

  /**
   * Vérifier la validité d'un coupon
   */
  static async validateCoupon(code: string, orderAmount: number): Promise<ServiceResponse<{
    valid: boolean;
    discount: number;
    message?: string;
  }>> {
    try {
      const couponResponse = await this.getByCode(code);
      if (!couponResponse.success || !couponResponse.data) {
        return this.createResponse({
          valid: false,
          discount: 0,
          message: 'Coupon non trouvé'
        });
      }

      const coupon = couponResponse.data;

      // Vérifier les conditions
      const now = new Date();
      const startDate = new Date(coupon.start_date);
      const endDate = new Date(coupon.end_date);

      if (now < startDate) {
        return this.createResponse({
          valid: false,
          discount: 0,
          message: 'Coupon pas encore valide'
        });
      }

      if (now > endDate) {
        return this.createResponse({
          valid: false,
          discount: 0,
          message: 'Coupon expiré'
        });
      }

      if (coupon.min_amount && orderAmount < coupon.min_amount) {
        return this.createResponse({
          valid: false,
          discount: 0,
          message: `Montant minimum requis: ${coupon.min_amount} FCFA`
        });
      }

      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return this.createResponse({
          valid: false,
          discount: 0,
          message: 'Limite d\'utilisation atteinte'
        });
      }

      // Calculer la réduction
      let discount = 0;
      switch (coupon.type) {
        case 'percentage':
          discount = (orderAmount * coupon.value) / 100;
          if (coupon.max_discount) {
            discount = Math.min(discount, coupon.max_discount);
          }
          break;
        case 'fixed':
          discount = coupon.value;
          break;
        case 'free_shipping':
          discount = 0; // Géré côté commande
          break;
      }

      return this.createResponse({
        valid: true,
        discount,
        message: 'Coupon valide'
      });
    } catch (error) {
      return this.createResponse({
        valid: false,
        discount: 0,
        message: this.handleError(error)
      });
    }
  }
}