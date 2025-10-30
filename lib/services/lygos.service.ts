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
      
      // Préparer le payload selon la documentation Lygos
      const payload = {
        amount: Math.round(input.amount), // Montant en centimes
        currency: input.currency || 'XOF',
        shop_name: 'JomionStore', // Nom de la boutique requis par Lygos
        customer: {
          first_name: input.customer.firstName,
          last_name: input.customer.lastName,
          email: input.customer.email,
          phone: input.customer.phone,
          address: input.customer.address || '',
          city: input.customer.city || 'Cotonou',
          country: input.customer.country || 'BJ'
        },
        order_id: input.orderId,
        return_url: input.returnUrl,
        webhook_url: input.webhookUrl,
        description: input.description || `Commande ${input.orderId}`
      };

      console.log('[Lygos] Création passerelle:', { order_id: input.orderId, amount: input.amount });

      const response = await fetch(`${baseUrl}/v1/gateway`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Lygos] Erreur création passerelle:', errorText);
        throw new Error(`Lygos API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      console.log('[Lygos] Réponse complète:', JSON.stringify(data, null, 2));

      if (!data.gateway_id && !data.id) {
        console.error('[Lygos] Réponse invalide:', data);
        throw new Error('Lygos n\'a pas retourné d\'ID de passerelle');
      }

      console.log('[Lygos] Passerelle créée avec succès:', data.gateway_id);

      return {
        gateway_id: data.gateway_id || data.id,
        payment_url: data.payment_url || data.url || `${baseUrl}/gateway/${data.gateway_id || data.id}`,
        status: data.status || 'created',
        expires_at: data.expires_at
      };
    } catch (error: any) {
      console.error('[Lygos] Erreur lors de la création de la passerelle:', error);
      throw new Error(error.message || 'Échec de la création de la passerelle Lygos');
    }
  }

  /**
   * Vérifier le statut d'un paiement Lygos
   */
  static async getPaymentStatus(orderId: string): Promise<LygosPaymentStatus> {
    try {
      const baseUrl = this.getBaseUrl();

      console.log('[Lygos] Vérification statut paiement:', orderId);

      const response = await fetch(`${baseUrl}/v1/gateway/payin/${orderId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Lygos] Erreur vérification statut:', errorText);
        throw new Error(`Lygos status API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      console.log('[Lygos] Statut reçu:', data);

      return {
        order_id: orderId,
        status: data.status || 'unknown',
        amount: data.amount,
        currency: data.currency,
        transaction_id: data.transaction_id,
        gateway_id: data.gateway_id,
        message: data.message,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error: any) {
      console.error('[Lygos] Erreur lors de la vérification du statut:', error);
      throw new Error(error.message || 'Échec de la vérification du statut Lygos');
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
}