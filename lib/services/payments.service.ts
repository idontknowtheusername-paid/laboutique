import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: 'card' | 'mobile_money' | 'bank_transfer' | 'paystack' | 'flutterwave';
  provider: 'paystack' | 'flutterwave' | 'stripe' | 'mtn_momo' | 'orange_money';
  provider_transaction_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  metadata?: any;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  failed_reason?: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'card' | 'mobile_money' | 'bank_account';
  provider: string;
  last_four?: string;
  phone_number?: string;
  bank_name?: string;
  is_default: boolean;
  is_verified: boolean;
  metadata?: any;
  created_at: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  payment_method: Payment['payment_method'];
  provider: Payment['provider'];
  client_secret?: string;
  authorization_url?: string;
  reference: string;
  metadata?: any;
  expires_at: string;
}

export interface MobileMoneyProvider {
  code: string;
  name: string;
  country: string;
  currency: string;
  is_active: boolean;
}

export class PaymentsService extends BaseService {
  /**
   * Créer une intention de paiement
   */
  static async createPaymentIntent(data: {
    order_id: string;
    user_id: string;
    amount: number;
    currency: string;
    payment_method: Payment['payment_method'];
    provider: Payment['provider'];
    metadata?: any;
  }): Promise<ServiceResponse<PaymentIntent | null>> {
    try {
      const reference = `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      let authorizationUrl = '';
      let clientSecret = '';

      // Intégration avec les providers de paiement
      switch (data.provider) {
        case 'paystack':
          const paystackResponse = await this.initializePaystack({
            email: 'user@example.com', // TODO: récupérer l'email de l'utilisateur
            amount: data.amount * 100, // Paystack utilise les kobo
            reference,
            currency: data.currency,
            metadata: data.metadata
          });
          authorizationUrl = paystackResponse.authorization_url;
          break;

        case 'flutterwave':
          const flutterwaveResponse = await this.initializeFlutterwave({
            amount: data.amount,
            currency: data.currency,
            tx_ref: reference,
            customer: { email: 'user@example.com' }, // TODO: récupérer les données utilisateur
            metadata: data.metadata
          });
          authorizationUrl = flutterwaveResponse.link;
          break;

        case 'mtn_momo':
        case 'orange_money':
          // Initialiser le paiement mobile money
          const momoResponse = await this.initializeMobileMoney({
            provider: data.provider,
            amount: data.amount,
            currency: data.currency,
            phone: data.metadata?.phone,
            reference
          });
          break;
      }

      const supabaseClient = this.getSupabaseClient() as any;
      const { data: intent, error } = await supabaseClient
        .from('payment_intents')
        .insert({
          amount: data.amount,
          currency: data.currency,
          payment_method: data.payment_method,
          provider: data.provider,
          client_secret: clientSecret,
          authorization_url: authorizationUrl,
          reference,
          metadata: data.metadata,
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        })
        .select()
        .single();

      if (error) throw error;

      // Créer l'enregistrement de paiement
      await this.createPayment({
        order_id: data.order_id,
        user_id: data.user_id,
        amount: data.amount,
        currency: data.currency,
        payment_method: data.payment_method,
        provider: data.provider,
        reference
      });

      return this.createResponse(intent as PaymentIntent);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Créer un paiement
   */
  static async createPayment(data: {
    order_id: string;
    user_id: string;
    amount: number;
    currency: string;
    payment_method: Payment['payment_method'];
    provider: Payment['provider'];
    reference: string;
    metadata?: any;
  }): Promise<ServiceResponse<Payment | null>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { data: payment, error } = await supabaseClient
        .from('payments')
        .insert({
          order_id: data.order_id,
          user_id: data.user_id,
          amount: data.amount,
          currency: data.currency,
          payment_method: data.payment_method,
          provider: data.provider,
          provider_transaction_id: data.reference,
          status: 'pending',
          metadata: data.metadata
        })
        .select()
        .single();

      if (error) throw error;
      return this.createResponse(payment as Payment);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  static async verifyPayment(reference: string): Promise<ServiceResponse<{
    status: Payment['status'];
    provider_data?: any;
  } | null>> {
    try {
      // Récupérer le paiement
      const { data: payment } = await this.getSupabaseClient()
        .from('payments')
        .select('*')
        .eq('provider_transaction_id', reference)
        .single();

      if (!payment) {
        return this.createResponse(null, 'Paiement non trouvé');
      }

      let verificationResult;

      // Vérifier selon le provider
      switch (payment.provider) {
        case 'paystack':
          verificationResult = await this.verifyPaystack(reference);
          break;
        case 'flutterwave':
          verificationResult = await this.verifyFlutterwave(reference);
          break;
        case 'mtn_momo':
        case 'orange_money':
          verificationResult = await this.verifyMobileMoney(reference, payment.provider);
          break;
        default:
          return this.createResponse(null, 'Provider non supporté');
      }

      // Mettre à jour le statut du paiement
      if (verificationResult.success) {
        await this.updatePaymentStatus(payment.id, 'completed', verificationResult.data);
      } else {
        await this.updatePaymentStatus(payment.id, 'failed', null, verificationResult.error);
      }

      return this.createResponse({
        status: verificationResult.success ? 'completed' : 'failed',
        provider_data: verificationResult.data
      });
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Mettre à jour le statut d'un paiement
   */
  static async updatePaymentStatus(
    paymentId: string,
    status: Payment['status'],
    providerData?: any,
    failedReason?: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      if (status === 'failed' && failedReason) {
        updateData.failed_reason = failedReason;
      }

      if (providerData) {
        updateData.metadata = { ...updateData.metadata, provider_data: providerData };
      }

      const supabaseClient = this.getSupabaseClient() as any;
      const { error } = await supabaseClient
        .from('payments')
        .update(updateData)
        .eq('id', paymentId);

      if (error) throw error;
      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Récupérer les paiements d'un utilisateur
   */
  static async getUserPayments(
    userId: string,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Payment>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      const { data, error, count } = await this.getSupabaseClient()
        .from('payments')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const paginationInfo = this.calculatePagination(page, limit, total);

      return this.createPaginatedResponse((data as Payment[]) || [], paginationInfo);
    } catch (error) {
      return this.createPaginatedResponse([], {
        page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false
      }, this.handleError(error));
    }
  }

  /**
   * Ajouter une méthode de paiement
   */
  static async addPaymentMethod(data: {
    user_id: string;
    type: PaymentMethod['type'];
    provider: string;
    phone_number?: string;
    last_four?: string;
    bank_name?: string;
    metadata?: any;
  }): Promise<ServiceResponse<PaymentMethod | null>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { data: method, error } = await supabaseClient
        .from('payment_methods')
        .insert({
          user_id: data.user_id,
          type: data.type,
          provider: data.provider,
          phone_number: data.phone_number,
          last_four: data.last_four,
          bank_name: data.bank_name,
          is_default: false,
          is_verified: false,
          metadata: data.metadata
        })
        .select()
        .single();

      if (error) throw error;
      return this.createResponse(method as PaymentMethod);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer les providers Mobile Money disponibles
   */
  static async getMobileMoneyProviders(country?: string): Promise<ServiceResponse<MobileMoneyProvider[]>> {
    try {
      let query = this.getSupabaseClient()
        .from('mobile_money_providers')
        .select('*')
        .eq('is_active', true);

      if (country) {
        query = query.eq('country', country);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;
      return this.createResponse((data as MobileMoneyProvider[]) || []);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Méthodes privées pour les intégrations
   */
  private static async initializePaystack(data: {
    email: string;
    amount: number;
    reference: string;
    currency: string;
    metadata?: any;
  }): Promise<{ authorization_url: string; access_code: string; reference: string }> {
    // TODO: Implémenter l'intégration Paystack
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    return result.data;
  }

  private static async initializeFlutterwave(data: any): Promise<{ link: string }> {
    // TODO: Implémenter l'intégration Flutterwave
    return { link: 'https://checkout.flutterwave.com/v3/hosted/pay/example' };
  }

  private static async initializeMobileMoney(data: {
    provider: string;
    amount: number;
    currency: string;
    phone?: string;
    reference: string;
  }): Promise<any> {
    // TODO: Implémenter l'intégration Mobile Money
    return { success: true };
  }

  private static async verifyPaystack(reference: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      });

      const result = await response.json();
      return {
        success: result.status && result.data.status === 'success',
        data: result.data
      };
    } catch (error) {
      return { success: false, error: 'Erreur de vérification Paystack' };
    }
  }

  private static async verifyFlutterwave(reference: string): Promise<{ success: boolean; data?: any; error?: string }> {
    // TODO: Implémenter la vérification Flutterwave
    return { success: true };
  }

  private static async verifyMobileMoney(reference: string, provider: string): Promise<{ success: boolean; data?: any; error?: string }> {
    // TODO: Implémenter la vérification Mobile Money
    return { success: true };
  }

  /**
   * Récupérer les statistiques de paiement
   */
  static async getPaymentStats(dateFrom?: string, dateTo?: string): Promise<ServiceResponse<{
    total_amount: number;
    total_transactions: number;
    successful_transactions: number;
    failed_transactions: number;
    by_method: Record<string, { count: number; amount: number }>;
    by_provider: Record<string, { count: number; amount: number }>;
  }>> {
    try {
      const fromDate = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const toDate = dateTo || new Date().toISOString();

      const { data: payments } = await this.getSupabaseClient()
        .from('payments')
        .select('*')
        .gte('created_at', fromDate)
        .lte('created_at', toDate);

      const paymentsData = payments as Payment[] || [];

      const stats = {
        total_amount: paymentsData.reduce((sum, p) => sum + p.amount, 0),
        total_transactions: paymentsData.length,
        successful_transactions: paymentsData.filter(p => p.status === 'completed').length,
        failed_transactions: paymentsData.filter(p => p.status === 'failed').length,
        by_method: paymentsData.reduce((acc, p) => {
          if (!acc[p.payment_method]) acc[p.payment_method] = { count: 0, amount: 0 };
          acc[p.payment_method].count++;
          acc[p.payment_method].amount += p.amount;
          return acc;
        }, {} as Record<string, { count: number; amount: number }>),
        by_provider: paymentsData.reduce((acc, p) => {
          if (!acc[p.provider]) acc[p.provider] = { count: 0, amount: 0 };
          acc[p.provider].count++;
          acc[p.provider].amount += p.amount;
          return acc;
        }, {} as Record<string, { count: number; amount: number }>)
      };

      return this.createResponse(stats);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }
}