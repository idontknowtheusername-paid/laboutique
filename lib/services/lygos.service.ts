import { BaseService } from './base.service';

/**
 * Interface pour créer une passerelle de paiement Lygos
 */
export interface CreateLygosGatewayInput {
  amount: number; // Montant en XOF
  currency?: string; // Devise (par défaut XOF)
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    country?: string;
  };
  orderId: string; // Référence unique de la commande
  returnUrl: string; // URL de retour après paiement
  webhookUrl?: string; // URL de webhook pour les notifications
  description?: string; // Description du paiement
}

/**
 * Réponse de Lygos après création de la passerelle
 */
export interface LygosGatewayResponse {
  gateway_id: string; // ID de la passerelle créée
  payment_url: string; // URL de redirection pour le paiement
  status: string; // Statut de la passerelle
  expires_at?: string; // Date d'expiration
}

/**
 * Statut d'un paiement Lygos
 */
export interface LygosPaymentStatus {
  order_id: string;
  status: string; // success, pending, failed, etc.
  amount?: number;
  currency?: string;
  transaction_id?: string;
  gateway_id?: string;
  message?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Service pour gérer les paiements avec Lygos
 */
export class LygosService extends BaseService {
  /**
   * Récupérer l'URL de base de l'API
   */
  private static getBaseUrl(): string {
    const mode = process.env.LYGOS_MODE || 'sandbox';
    
    if (process.env.LYGOS_API_URL) {
      return process.env.LYGOS_API_URL;
    }
    
    return mode === 'production'
      ? 'https://api.lygosapp.com'
      : 'https://api.lygosapp.com'; // Même URL pour sandbox et prod
  }

  /**
   * Récupérer la clé API Lygos
   */
  private static getApiKey(): string {
    const apiKey = process.env.LYGOS_API_KEY;
    if (!apiKey) {
      throw new Error('LYGOS_API_KEY est manquant dans les variables d\'environnement');
    }
    return apiKey;
  }

  /**
   * Headers par défaut pour les requêtes API
   */
  private static getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'api-key': this.getApiKey(),
    };
  }

  /**
   * Créer une passerelle de paiement Lygos
   */
  static async createGateway(input: CreateLygosGatewayInput): Promise<LygosGatewayResponse> {
    try {
      const baseUrl = this.getBaseUrl();
      
      // Préparer le payload selon la vraie documentation Lygos
      const payload = {
        amount: Math.round(input.amount), // Montant en FCFA (pas en centimes pour Lygos)
        currency: input.currency || 'XOF',
        customer_firstname: input.customer.firstName,
        customer_lastname: input.customer.lastName,
        customer_email: input.customer.email,
        customer_phone: input.customer.phone,
        customer_address: input.customer.address || 'Cotonou',
        customer_city: input.customer.city || 'Cotonou',
        customer_country: input.customer.country || 'BJ',
        order_id: input.orderId,
        return_url: input.returnUrl,
        webhook_url: input.webhookUrl || '',
        description: input.description || `Commande JomionStore ${input.orderId}`,
        // Champs requis par Lygos
        shop_name: 'JomionStore',
        shop_url: process.env.NEXT_PUBLIC_APP_URL || 'https://jomionstore.com'
      };

      console.log('[Lygos] 🚀 Création passerelle:', {
        order_id: input.orderId,
        amount: input.amount,
        customer: input.customer.email
      });

      const response = await fetch(`${baseUrl}/v1/gateway/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('[Lygos] 📥 Réponse brute:', responseText);

      if (!response.ok) {
        console.error('[Lygos] ❌ Erreur HTTP:', response.status, responseText);
        throw new Error(`Lygos API error: ${response.status} - ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[Lygos] ❌ Erreur parsing JSON:', parseError);
        throw new Error('Réponse Lygos invalide (pas du JSON)');
      }
      
      console.log('[Lygos] 📋 Réponse parsée:', JSON.stringify(data, null, 2));

      // Vérifier la structure de la réponse Lygos
      if (!data.success && !data.status) {
        console.error('[Lygos] ❌ Réponse d\'erreur:', data);
        throw new Error(data.message || data.error || 'Erreur inconnue de Lygos');
      }

      // Extraire les données selon la vraie structure Lygos
      const gatewayId = data.gateway_id || data.id || data.data?.gateway_id || data.data?.id;
      const paymentUrl = data.payment_url || data.url || data.link || data.data?.payment_url || data.data?.url;

      if (!gatewayId) {
        console.error('[Lygos] ❌ Pas de gateway_id dans la réponse:', data);
        throw new Error('Lygos n\'a pas retourné d\'ID de passerelle valide');
      }

      // Construire l'URL de paiement selon les standards Lygos
      let finalPaymentUrl = paymentUrl;

      if (!finalPaymentUrl) {
        // Construire l'URL selon le format standard Lygos
        finalPaymentUrl = `https://checkout.lygosapp.com/pay/${gatewayId}`;
        console.log('[Lygos] 🔗 URL construite:', finalPaymentUrl);
      } else {
        // Vérifier que l'URL est complète
        if (!finalPaymentUrl.startsWith('http')) {
          finalPaymentUrl = `https://checkout.lygosapp.com${finalPaymentUrl.startsWith('/') ? '' : '/'}${finalPaymentUrl}`;
        }
        console.log('[Lygos] 🔗 URL fournie par Lygos:', finalPaymentUrl);
      }

      const result = {
        gateway_id: gatewayId,
        payment_url: finalPaymentUrl,
        status: data.status || 'created',
        expires_at: data.expires_at || data.data?.expires_at
      };

      console.log('[Lygos] ✅ Passerelle créée avec succès:', result);

      return result;
    } catch (error: any) {
      console.error('[Lygos] 💥 Erreur lors de la création de la passerelle:', error);
      throw new Error(error.message || 'Échec de la création de la passerelle Lygos');
    }
  }

  /**
   * Vérifier le statut d'un paiement Lygos
   */
  static async getPaymentStatus(gatewayIdOrOrderId: string): Promise<LygosPaymentStatus> {
    try {
      const baseUrl = this.getBaseUrl();

      console.log('[Lygos] 🔍 Vérification statut paiement:', gatewayIdOrOrderId);

      // Essayer plusieurs endpoints selon la documentation Lygos
      const endpoints = [
        `/v1/gateway/status/${gatewayIdOrOrderId}`,
        `/v1/gateway/${gatewayIdOrOrderId}/status`,
        `/v1/payment/status/${gatewayIdOrOrderId}`,
        `/v1/transaction/${gatewayIdOrOrderId}`
      ];

      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log('[Lygos] 🎯 Tentative endpoint:', endpoint);

          const response = await fetch(`${baseUrl}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(),
          });

          const responseText = await response.text();
          console.log('[Lygos] 📥 Réponse brute:', responseText);

          if (response.ok) {
            let data;
            try {
              data = JSON.parse(responseText);
            } catch (parseError) {
              console.warn('[Lygos] ⚠️ Réponse non-JSON:', responseText);
              continue;
            }

            console.log('[Lygos] 📋 Statut reçu:', data);

            // Extraire les données selon la structure Lygos
            const statusData = data.data || data;

            return {
              order_id: statusData.order_id || gatewayIdOrOrderId,
              status: statusData.status || statusData.payment_status || 'unknown',
              amount: statusData.amount,
              currency: statusData.currency || 'XOF',
              transaction_id: statusData.transaction_id || statusData.reference || undefined,
              gateway_id: statusData.gateway_id || gatewayIdOrOrderId,
              message: statusData.message || statusData.description,
              created_at: statusData.created_at,
              updated_at: statusData.updated_at
            };
          } else {
            lastError = `${response.status}: ${responseText}`;
            console.warn('[Lygos] ⚠️ Endpoint échoué:', endpoint, lastError);
          }
        } catch (endpointError) {
          lastError = endpointError;
          console.warn('[Lygos] ⚠️ Erreur endpoint:', endpoint, endpointError);
        }
      }

      // Si tous les endpoints échouent, retourner un statut par défaut
      console.warn('[Lygos] ⚠️ Tous les endpoints ont échoué, statut par défaut');

      return {
        order_id: gatewayIdOrOrderId,
        status: 'pending', // Statut par défaut
        amount: 0,
        currency: 'XOF',
        transaction_id: undefined,
        gateway_id: gatewayIdOrOrderId,
        message: `Impossible de vérifier le statut: ${lastError}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('[Lygos] 💥 Erreur lors de la vérification du statut:', error);

      // Retourner un statut d'erreur plutôt que de lever une exception
      return {
        order_id: gatewayIdOrOrderId,
        status: 'error',
        amount: 0,
        currency: 'XOF',
        transaction_id: undefined,
        gateway_id: gatewayIdOrOrderId,
        message: error.message || 'Erreur de vérification du statut',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  /**
   * Vérifier si le paiement est réussi selon le statut
   */
  static isPaymentSuccessful(status: string): boolean {
    const successStatuses = ['success', 'successful', 'completed', 'paid', 'confirmed'];
    return successStatuses.includes(status.toLowerCase());
  }

  /**
   * Vérifier si le paiement a échoué selon le statut
   */
  static isPaymentFailed(status: string): boolean {
    const failedStatuses = ['failed', 'error', 'cancelled', 'canceled', 'rejected', 'expired'];
    return failedStatuses.includes(status.toLowerCase());
  }

  /**
   * Vérifier si le paiement est en attente selon le statut
   */
  static isPaymentPending(status: string): boolean {
    const pendingStatuses = ['pending', 'processing', 'created', 'initiated'];
    return pendingStatuses.includes(status.toLowerCase());
  }

  /**
   * Tester la configuration Lygos
   */
  static async testConfiguration(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const baseUrl = this.getBaseUrl();
      const apiKey = this.getApiKey();

      console.log('[Lygos] 🧪 Test de configuration...');
      console.log('[Lygos] 🔗 Base URL:', baseUrl);
      console.log('[Lygos] 🔑 API Key présente:', !!apiKey);

      // Test simple de l'API
      const response = await fetch(`${baseUrl}/v1/ping`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const responseText = await response.text();

      if (response.ok) {
        return {
          success: true,
          message: 'Configuration Lygos valide',
          details: { status: response.status, response: responseText }
        };
      } else {
        return {
          success: false,
          message: `Erreur de configuration Lygos: ${response.status}`,
          details: { status: response.status, response: responseText }
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Erreur de test Lygos: ${error.message}`,
        details: { error: error.message }
      };
    }
  }
}