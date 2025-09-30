import { BaseService, ServiceResponse } from './base.service';
import { isSupabaseConfigured } from '@/lib/supabase';

export interface PaymentAlert {
  id: string;
  order_id: string;
  order_number: string;
  amount: number;
  currency: string;
  status: 'failed' | 'pending' | 'refunded';
  failure_reason?: string;
  created_at: string;
  customer_email?: string;
}

export interface PaymentStats {
  total_payments: number;
  failed_payments: number;
  pending_payments: number;
  success_rate: number;
  total_amount: number;
  failed_amount: number;
}

export class PaymentsService extends BaseService {
  // Obtenir les alertes de paiement
  static async getPaymentAlerts(): Promise<ServiceResponse<PaymentAlert[]>> {
    if (!isSupabaseConfigured()) {
      return this.getMockResponse([]);
    }

    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          currency,
          payment_status,
          payment_method,
          created_at,
          user_id,
          profiles!orders_user_id_fkey(email)
        `)
        .in('payment_status', ['failed', 'pending'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const alerts: PaymentAlert[] = (data || []).map(order => ({
        id: order.id,
        order_id: order.id,
        order_number: order.order_number,
        amount: order.total_amount,
        currency: order.currency || 'XOF',
        status: order.payment_status === 'failed' ? 'failed' : 'pending',
        created_at: order.created_at,
        customer_email: order.profiles?.email
      }));

      return this.getSuccessResponse(alerts);
    } catch (error) {
      return this.getErrorResponse('Erreur lors de la récupération des alertes de paiement', error);
    }
  }

  // Obtenir les statistiques de paiement
  static async getPaymentStats(): Promise<ServiceResponse<PaymentStats>> {
    if (!isSupabaseConfigured()) {
      return this.getMockResponse({
        total_payments: 0,
        failed_payments: 0,
        pending_payments: 0,
        success_rate: 0,
        total_amount: 0,
        failed_amount: 0
      });
    }

    try {
      const { data: orders, error } = await this.supabase
        .from('orders')
        .select('payment_status, total_amount')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 30 derniers jours

      if (error) throw error;

      const stats = (orders || []).reduce((acc, order) => {
        acc.total_payments++;
        acc.total_amount += order.total_amount || 0;

        if (order.payment_status === 'failed') {
          acc.failed_payments++;
          acc.failed_amount += order.total_amount || 0;
        } else if (order.payment_status === 'pending') {
          acc.pending_payments++;
        }

        return acc;
      }, {
        total_payments: 0,
        failed_payments: 0,
        pending_payments: 0,
        success_rate: 0,
        total_amount: 0,
        failed_amount: 0
      });

      // Calculer le taux de succès
      const successful_payments = stats.total_payments - stats.failed_payments - stats.pending_payments;
      stats.success_rate = stats.total_payments > 0 ? (successful_payments / stats.total_payments) * 100 : 0;

      return this.getSuccessResponse(stats);
    } catch (error) {
      return this.getErrorResponse('Erreur lors de la récupération des statistiques de paiement', error);
    }
  }

  // Retry un paiement échoué
  static async retryPayment(orderId: string): Promise<ServiceResponse<boolean>> {
    if (!isSupabaseConfigured()) {
      return this.getMockResponse(true);
    }

    try {
      const { error } = await this.supabase
        .from('orders')
        .update({ 
          payment_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      return this.getSuccessResponse(true);
    } catch (error) {
      return this.getErrorResponse('Erreur lors de la nouvelle tentative de paiement', error);
    }
  }
}