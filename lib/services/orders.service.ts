import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';
import { Database } from '@/types/database';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  payment_method?: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  shipping_address?: any;
  billing_address?: any;
  notes?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  // Relations
  order_items?: OrderItem[];
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  vendor_id: string;
  quantity: number;
  price: number;
  total: number;
  created_at: string;
  // Relations
  product?: {
    id: string;
    name: string;
    slug: string;
    images?: string[];
  };
  vendor?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface OrderFilters {
  user_id?: string;
  vendor_id?: string;
  status?: Order['status'];
  payment_status?: Order['payment_status'];
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
}

export interface CreateOrderData {
  user_id: string;
  items: Array<{
    product_id: string;
    vendor_id: string;
    quantity: number;
    price: number;
  }>;
  shipping_address: any;
  billing_address?: any;
  payment_method?: string;
  notes?: string;
  coupon_code?: string;
}

export interface UpdateOrderData {
  id: string;
  status?: Order['status'];
  payment_status?: Order['payment_status'];
  payment_method?: string;
  shipping_address?: any;
  billing_address?: any;
  notes?: string;
}

export interface OrderStats {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  average_order_value: number;
  monthly_stats: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
}

export class OrdersService extends BaseService {
  /**
   * Récupérer toutes les commandes avec pagination
   */
  static async getAll(
    filters: OrderFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Order>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = this.getSupabaseClient()
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (id, name, slug, images),
            vendor:vendors (id, name, slug)
          )
        `, { count: 'exact' });

      // Appliquer les filtres
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      // Note: Pour filtrer par vendor_id, nous devrons faire une jointure plus complexe
      // ou utiliser une approche différente car order_items est une relation

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.payment_status) {
        query = query.eq('payment_status', filters.payment_status);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      if (filters.min_amount !== undefined) {
        query = query.gte('total_amount', filters.min_amount);
      }

      if (filters.max_amount !== undefined) {
        query = query.lte('total_amount', filters.max_amount);
      }

      // Recherche dans order_number et notes
      // Note: La recherche dans user.first_name/last_name nécessite une approche différente
      // car c'est une relation. Pour l'instant, on cherche dans order_number et notes.
      if (filters.search) {
        query = query.or(`order_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
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
   * Récupérer une commande par son ID
   */
  static async getById(id: string): Promise<ServiceResponse<Order | null>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (id, name, slug, images, price),
            vendor:vendors (id, name, slug, logo_url)
          )
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
   * Récupérer une commande par son numéro
   */
  static async getByOrderNumber(orderNumber: string): Promise<ServiceResponse<Order | null>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (id, name, slug, images, price),
            vendor:vendors (id, name, slug, logo_url)
          )
        `)
        .eq('order_number', orderNumber)
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer une commande par une référence présente dans les notes (utile pour idempotence via passerelles)
   */
  static async getByReferenceInNotes(reference: string): Promise<ServiceResponse<Order | null>> {
    try {
      const { data, error } = await (this.getSupabaseClient() as any)
        .from('orders')
        .select('*')
        .ilike('notes', `%${reference}%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer les commandes d'un utilisateur
   */
  static async getByUser(
    userId: string,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Order>> {
    return this.getAll(
      { user_id: userId },
      pagination
    );
  }

  /**
   * Récupérer les commandes d'un vendeur
   */
  static async getByVendor(
    vendorId: string,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Order>> {
    return this.getAll(
      { vendor_id: vendorId },
      pagination
    );
  }

  /**
   * Créer une nouvelle commande
   */
  static async create(orderData: CreateOrderData): Promise<ServiceResponse<Order | null>> {
    try {
      console.log('[OrdersService] 🚀 Début création commande...');

      // Générer un numéro de commande unique
      const orderNumber = await this.generateOrderNumber();
      console.log('[OrdersService] 📋 Numéro généré:', orderNumber);

      // Calculer les totaux
      const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxAmount = subtotal * 0.02; // 2% de TVA (ajustable)
      const shippingAmount = 2000; // Frais de livraison fixes (ajustable)
      const discountAmount = 0; // À implémenter avec les coupons
      const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

      console.log('[OrdersService] 💰 Totaux calculés:', { subtotal, taxAmount, shippingAmount, totalAmount });

      // Créer la commande avec le client admin pour bypasser RLS
      console.log('[OrdersService] 🔑 Import supabaseAdmin...');
      const { supabaseAdmin } = await import('@/lib/supabase-server');

      if (!supabaseAdmin) {
        throw new Error('supabaseAdmin non disponible');
      }

      console.log('[OrdersService] ✅ supabaseAdmin importé');

      const orderPayload = {
        order_number: orderNumber,
        user_id: orderData.user_id,
        status: 'pending',
        payment_status: 'pending',
        payment_method: orderData.payment_method,
        subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        currency: 'XOF',
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address || orderData.shipping_address,
        notes: orderData.notes
      };

      console.log('[OrdersService] 📤 Insertion commande:', orderPayload);

      const { data: order, error: orderError } = await (supabaseAdmin as any)
        .from('orders')
        .insert([orderPayload])
        .select()
        .single();

      console.log('[OrdersService] 📥 Résultat insertion:', { order: !!order, error: orderError });

      if (orderError) {
        console.error('[OrdersService] ❌ Erreur insertion commande:', orderError);
        throw orderError;
      }

      // Créer les items de commande
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        vendor_id: item.vendor_id,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      }));

      console.log('[OrdersService] 📦 Insertion order_items:', orderItems.length, 'items');

      const { error: itemsError } = await (supabaseAdmin as any)
        .from('order_items')
        .insert(orderItems);

      console.log('[OrdersService] 📥 Résultat insertion items:', { error: itemsError });

      if (itemsError) {
        console.error('[OrdersService] ❌ Erreur insertion items:', itemsError);
        throw itemsError;
      }

      // Retourner la commande créée directement (sans jointure complexe)
      // Ajouter les champs manquants pour compatibilité
      const orderWithDefaults = {
        ...order,
        order_items: [],
        user: null
      };

      console.log('[OrdersService] ✅ Commande créée avec succès:', orderWithDefaults.id);
      return this.createResponse(orderWithDefaults);
    } catch (error: any) {
      console.error('[OrdersService] 💥 Erreur finale dans create:', error);
      return this.createResponse(null, `Erreur OrdersService: ${error.message} | Code: ${error.code} | Details: ${JSON.stringify(error.details)} | Hint: ${error.hint}`);
    }
  }

  /**
   * Mettre à jour une commande
   */
  static async update(updateData: UpdateOrderData): Promise<ServiceResponse<Order | null>> {
    try {
      const { id, ...dataToUpdate } = updateData;

      const { data, error } = await (this.getSupabaseClient() as any)
        .from('orders')
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
   * Mettre à jour le statut d'une commande
   */
  static async updateStatus(
    id: string,
    status: Order['status']
  ): Promise<ServiceResponse<Order | null>> {
    return this.update({ id, status });
  }

  /**
   * Mettre à jour le statut de paiement
   */
  static async updatePaymentStatus(
    id: string,
    paymentStatus: Order['payment_status']
  ): Promise<ServiceResponse<Order | null>> {
    return this.update({ id, payment_status: paymentStatus });
  }

  /**
   * Logger un changement de statut
   */
  static async logStatusChange(
    orderId: string,
    oldStatus: string,
    newStatus: string,
    changedBy: string,
    reason?: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient()
        .from('order_status_history')
        .insert([{
          order_id: orderId,
          old_status: oldStatus,
          new_status: newStatus,
          changed_by: changedBy,
          reason: reason,
          changed_at: new Date().toISOString()
        }]);

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Annuler une commande
   */
  static async cancel(id: string, reason?: string): Promise<ServiceResponse<Order | null>> {
    try {
      const { data, error } = await (this.getSupabaseClient() as any)
        .from('orders')
        .update({
          status: 'cancelled',
          notes: reason ? `Annulée: ${reason}` : 'Commande annulée',
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
   * Récupérer les statistiques des commandes
   */
  static async getStats(
    filters: { vendor_id?: string; date_from?: string; date_to?: string } = {}
  ): Promise<ServiceResponse<OrderStats | null>> {
    try {
      let query = this.getSupabaseClient()
        .from('orders')
        .select('*');

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data: orders, error } = await query as { data: any[]; error: any };

      if (error) throw error;

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum: number, order: any) => sum + order.total_amount, 0) || 0;
      const pendingOrders = orders?.filter((order: any) => order.status === 'pending').length || 0;
      const completedOrders = orders?.filter((order: any) => order.status === 'delivered').length || 0;
      const cancelledOrders = orders?.filter((order: any) => order.status === 'cancelled').length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const stats: OrderStats = {
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        pending_orders: pendingOrders,
        completed_orders: completedOrders,
        cancelled_orders: cancelledOrders,
        average_order_value: averageOrderValue,
        monthly_stats: [] // À implémenter avec une logique de groupement par mois
      };

      return this.createResponse(stats);
    } catch (error) {
      return this.createResponse({
        total_orders: 0,
        total_revenue: 0,
        pending_orders: 0,
        completed_orders: 0,
        cancelled_orders: 0,
        average_order_value: 0,
        monthly_stats: []
      }, this.handleError(error));
    }
  }

  /**
   * Générer un numéro de commande unique
   */
  private static async generateOrderNumber(): Promise<string> {
    const prefix = 'ORD';
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Rechercher des commandes
   */
  static async search(
    query: string,
    filters: OrderFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Order>> {
    return this.getAll(
      { ...filters, search: query },
      pagination
    );
  }

  /**
   * Récupérer les commandes récentes
   */
  static async getRecent(limit: number = 10): Promise<ServiceResponse<Order[]>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (id, name, slug, images),
            vendor:vendors (id, name, slug)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }
}