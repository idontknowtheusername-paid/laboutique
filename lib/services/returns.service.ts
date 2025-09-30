import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';
import { isSupabaseConfigured } from '@/lib/supabase';

export interface ReturnRequest {
  id: string;
  order_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  refund_amount: number;
  return_type: 'refund' | 'exchange' | 'store_credit';
  created_at: string;
  updated_at: string;
  processed_at?: string;
  tracking_number?: string;
  notes?: string;
  admin_notes?: string;
  // Relations
  order?: {
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
  };
  customer?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  product?: {
    id: string;
    name: string;
    sku?: string;
    price: number;
  };
}

export interface ReturnFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  return_type?: 'refund' | 'exchange' | 'store_credit';
  search?: string;
  customer_id?: string;
  order_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface CreateReturnData {
  order_id: string;
  customer_id: string;
  product_id: string;
  reason: string;
  return_type: 'refund' | 'exchange' | 'store_credit';
  refund_amount: number;
  notes?: string;
}

export interface UpdateReturnData extends Partial<CreateReturnData> {
  id: string;
  status?: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  admin_notes?: string;
  tracking_number?: string;
}

export interface ReturnStats {
  total_returns: number;
  pending_returns: number;
  completed_returns: number;
  total_refunded: number;
  return_rate: number;
  average_processing_time: number;
  top_reasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  return_types: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export interface RefundTransaction {
  id: string;
  return_id: string;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed';
  processed_at?: string;
  created_at: string;
}

export class ReturnsService extends BaseService {
  /**
   * Récupérer toutes les demandes de retour avec pagination et filtres
   */
  static async getAll(
    filters: ReturnFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<ReturnRequest>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createPaginatedResponse([], { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false }, 'Supabase non configuré');
      }

      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = this.getSupabaseClient()
        .from('return_requests')
        .select(`
          id,
          order_id,
          customer_id,
          customer_name,
          customer_email,
          product_id,
          product_name,
          product_sku,
          reason,
          status,
          refund_amount,
          return_type,
          created_at,
          updated_at,
          processed_at,
          tracking_number,
          notes,
          admin_notes,
          order:orders!return_requests_order_id_fkey(
            id,
            order_number,
            total_amount,
            status
          ),
          customer:profiles!return_requests_customer_id_fkey(
            id,
            email,
            first_name,
            last_name
          ),
          product:products!return_requests_product_id_fkey(
            id,
            name,
            sku,
            price
          )
        `, { count: 'exact' });

      // Appliquer les filtres
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.return_type) {
        query = query.eq('return_type', filters.return_type);
      }

      if (filters.customer_id) {
        query = query.eq('customer_id', filters.customer_id);
      }

      if (filters.order_id) {
        query = query.eq('order_id', filters.order_id);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      if (filters.search) {
        query = query.or(`order_id.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,product_name.ilike.%${filters.search}%`);
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
   * Récupérer une demande de retour par ID
   */
  static async getById(id: string): Promise<ServiceResponse<ReturnRequest | null>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(null, 'Supabase non configuré');
      }

      const { data, error } = await this.getSupabaseClient()
        .from('return_requests')
        .select(`
          id,
          order_id,
          customer_id,
          customer_name,
          customer_email,
          product_id,
          product_name,
          product_sku,
          reason,
          status,
          refund_amount,
          return_type,
          created_at,
          updated_at,
          processed_at,
          tracking_number,
          notes,
          admin_notes,
          order:orders!return_requests_order_id_fkey(
            id,
            order_number,
            total_amount,
            status
          ),
          customer:profiles!return_requests_customer_id_fkey(
            id,
            email,
            first_name,
            last_name
          ),
          product:products!return_requests_product_id_fkey(
            id,
            name,
            sku,
            price
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
   * Créer une nouvelle demande de retour
   */
  static async create(returnData: CreateReturnData): Promise<ServiceResponse<ReturnRequest | null>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(null, 'Supabase non configuré');
      }

      // Vérifier que la commande existe et appartient au client
      const { data: order, error: orderError } = await this.getSupabaseClient()
        .from('orders')
        .select('id, user_id, status')
        .eq('id', returnData.order_id)
        .eq('user_id', returnData.customer_id)
        .single();

      if (orderError || !order) {
        return this.createResponse(null, 'Commande non trouvée ou non autorisée');
      }

      // Vérifier que le produit appartient à la commande
      const { data: orderItem, error: itemError } = await this.getSupabaseClient()
        .from('order_items')
        .select('id, product_id, quantity, price')
        .eq('order_id', returnData.order_id)
        .eq('product_id', returnData.product_id)
        .single();

      if (itemError || !orderItem) {
        return this.createResponse(null, 'Produit non trouvé dans cette commande');
      }

      // Récupérer les informations du client et du produit
      const { data: customer } = await this.getSupabaseClient()
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', returnData.customer_id)
        .single();

      const { data: product } = await this.getSupabaseClient()
        .from('products')
        .select('name, sku')
        .eq('id', returnData.product_id)
        .single();

      const { data, error } = await this.getSupabaseClient()
        .from('return_requests')
        .insert([{
          ...returnData,
          customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : 'Client inconnu',
          customer_email: customer?.email || '',
          product_name: product?.name || 'Produit inconnu',
          product_sku: product?.sku,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          id,
          order_id,
          customer_id,
          customer_name,
          customer_email,
          product_id,
          product_name,
          product_sku,
          reason,
          status,
          refund_amount,
          return_type,
          created_at,
          updated_at,
          notes
        `)
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Mettre à jour une demande de retour
   */
  static async update(updateData: UpdateReturnData): Promise<ServiceResponse<ReturnRequest | null>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(null, 'Supabase non configuré');
      }

      const { id, ...dataToUpdate } = updateData;

      const updateFields: any = {
        ...dataToUpdate,
        updated_at: new Date().toISOString()
      };

      // Si le statut passe à 'completed', ajouter la date de traitement
      if (dataToUpdate.status === 'completed') {
        updateFields.processed_at = new Date().toISOString();
      }

      const { data, error } = await this.getSupabaseClient()
        .from('return_requests')
        .update(updateFields)
        .eq('id', id)
        .select(`
          id,
          order_id,
          customer_id,
          customer_name,
          customer_email,
          product_id,
          product_name,
          product_sku,
          reason,
          status,
          refund_amount,
          return_type,
          created_at,
          updated_at,
          processed_at,
          tracking_number,
          notes,
          admin_notes
        `)
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Supprimer une demande de retour
   */
  static async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(false, 'Supabase non configuré');
      }

      const { error } = await this.getSupabaseClient()
        .from('return_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Approuver une demande de retour
   */
  static async approve(id: string, adminNotes?: string, trackingNumber?: string): Promise<ServiceResponse<ReturnRequest | null>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(null, 'Supabase non configuré');
      }

      const { data, error } = await this.getSupabaseClient()
        .from('return_requests')
        .update({
          status: 'approved',
          admin_notes: adminNotes,
          tracking_number: trackingNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          id,
          order_id,
          customer_id,
          customer_name,
          customer_email,
          product_id,
          product_name,
          product_sku,
          reason,
          status,
          refund_amount,
          return_type,
          created_at,
          updated_at,
          processed_at,
          tracking_number,
          notes,
          admin_notes
        `)
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Rejeter une demande de retour
   */
  static async reject(id: string, adminNotes?: string): Promise<ServiceResponse<ReturnRequest | null>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(null, 'Supabase non configuré');
      }

      const { data, error } = await this.getSupabaseClient()
        .from('return_requests')
        .update({
          status: 'rejected',
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          id,
          order_id,
          customer_id,
          customer_name,
          customer_email,
          product_id,
          product_name,
          product_sku,
          reason,
          status,
          refund_amount,
          return_type,
          created_at,
          updated_at,
          processed_at,
          tracking_number,
          notes,
          admin_notes
        `)
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Marquer une demande comme terminée
   */
  static async complete(id: string, adminNotes?: string): Promise<ServiceResponse<ReturnRequest | null>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(null, 'Supabase non configuré');
      }

      const { data, error } = await this.getSupabaseClient()
        .from('return_requests')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          id,
          order_id,
          customer_id,
          customer_name,
          customer_email,
          product_id,
          product_name,
          product_sku,
          reason,
          status,
          refund_amount,
          return_type,
          created_at,
          updated_at,
          processed_at,
          tracking_number,
          notes,
          admin_notes
        `)
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Obtenir les statistiques des retours
   */
  static async getStats(): Promise<ServiceResponse<ReturnStats>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse({
          total_returns: 0,
          pending_returns: 0,
          completed_returns: 0,
          total_refunded: 0,
          return_rate: 0,
          average_processing_time: 0,
          top_reasons: [],
          return_types: []
        }, 'Supabase non configuré');
      }

      // Récupérer toutes les demandes de retour
      const { data: returns, error: returnsError } = await this.getSupabaseClient()
        .from('return_requests')
        .select('id, status, refund_amount, reason, return_type, created_at, processed_at');

      if (returnsError) throw returnsError;

      // Récupérer le nombre total de commandes pour calculer le taux de retour
      const { data: orders, error: ordersError } = await this.getSupabaseClient()
        .from('orders')
        .select('id', { count: 'exact' });

      if (ordersError) throw ordersError;

      const totalReturns = returns?.length || 0;
      const pendingReturns = returns?.filter((r: any) => r.status === 'pending').length || 0;
      const completedReturns = returns?.filter((r: any) => r.status === 'completed').length || 0;
      const totalRefunded = returns?.reduce((sum: any, r: any) => sum + (r.refund_amount || 0), 0) || 0;
      const totalOrders = orders?.length || 1;
      const returnRate = (totalReturns / totalOrders) * 100;

      // Calculer le temps de traitement moyen
      const completedWithDates = returns?.filter((r: any) => r.status === 'completed' && r.processed_at && r.created_at) || [];
      const averageProcessingTime = completedWithDates.length > 0 
        ? completedWithDates.reduce((sum: any, r: any) => {
            const created = new Date(r.created_at);
            const processed = new Date(r.processed_at);
            return sum + (processed.getTime() - created.getTime());
          }, 0) / completedWithDates.length / (1000 * 60 * 60 * 24) // en jours
        : 0;

      // Analyser les raisons
      const reasonCounts: { [key: string]: number } = {};
      returns?.forEach((r: any) => {
        reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
      });

      const topReasons = Object.entries(reasonCounts)
        .map(([reason, count]) => ({
          reason,
          count,
          percentage: (count / totalReturns) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Analyser les types de retour
      const typeCounts: { [key: string]: number } = {};
      returns?.forEach((r: any) => {
        typeCounts[r.return_type] = (typeCounts[r.return_type] || 0) + 1;
      });

      const returnTypes = Object.entries(typeCounts)
        .map(([type, count]) => ({
          type,
          count,
          percentage: (count / totalReturns) * 100
        }))
        .sort((a, b) => b.count - a.count);

      return this.createResponse({
        total_returns: totalReturns,
        pending_returns: pendingReturns,
        completed_returns: completedReturns,
        total_refunded: totalRefunded,
        return_rate: returnRate,
        average_processing_time: averageProcessingTime,
        top_reasons: topReasons,
        return_types: returnTypes
      });
    } catch (error) {
      return this.createResponse({
        total_returns: 0,
        pending_returns: 0,
        completed_returns: 0,
        total_refunded: 0,
        return_rate: 0,
        average_processing_time: 0,
        top_reasons: [],
        return_types: []
      }, this.handleError(error));
    }
  }

  /**
   * Créer une transaction de remboursement
   */
  static async createRefundTransaction(
    returnId: string,
    amount: number,
    paymentMethod: string,
    transactionId?: string
  ): Promise<ServiceResponse<RefundTransaction | null>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(null, 'Supabase non configuré');
      }

      const { data, error } = await this.getSupabaseClient()
        .from('refund_transactions')
        .insert([{
          return_id: returnId,
          amount,
          payment_method: paymentMethod,
          transaction_id: transactionId,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select('*')
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Marquer une transaction de remboursement comme terminée
   */
  static async completeRefundTransaction(
    transactionId: string,
    externalTransactionId?: string
  ): Promise<ServiceResponse<RefundTransaction | null>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(null, 'Supabase non configuré');
      }

      const { data, error } = await this.getSupabaseClient()
        .from('refund_transactions')
        .update({
          status: 'completed',
          transaction_id: externalTransactionId,
          processed_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .select('*')
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }
}