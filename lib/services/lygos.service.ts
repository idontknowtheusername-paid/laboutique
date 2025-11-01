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
      
      // Payload selon la VRAIE documentation Lygos
      const payload = {
        amount: Math.round(input.amount), // Montant en FCFA
        shop_name: 'JomionStore',
        order_id: input.orderId,
        message: input.description || `Commande JomionStore ${input.orderId}`,
        success_url: input.returnUrl,
        failure_url: input.returnUrl
      };

      console.log('[Lygos] 🚀 Création passerelle (API officielle):', {
        order_id: input.orderId,
        amount: input.amount,
        shop_name: payload.shop_name
      });

      // Utiliser le bon endpoint selon la doc : POST /v1/gateway
      const response = await fetch(`${baseUrl}/v1/gateway`, {
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

      // Selon la doc Lygos, la réponse contient : id, amount, currency, shop_name, link, etc.
      if (!data.id) {
        console.error('[Lygos] ❌ Pas d\'ID dans la réponse:', data);
        throw new Error('Lygos n\'a pas retourné d\'ID de passerelle valide');
      }

      // Utiliser directement le champ "link" de Lygos (selon la doc officielle)
      let finalPaymentUrl = data.link;

      if (!finalPaymentUrl) {
        console.error('[Lygos] ❌ Pas de link dans la réponse:', data);
        throw new Error('Lygos n\'a pas retourné de lien de paiement');
      }

      // Vérifier que l'URL est complète
      if (!finalPaymentUrl.startsWith('http')) {
        finalPaymentUrl = `https://${finalPaymentUrl}`;
      }

      console.log('[Lygos] 🔗 URL de paiement Lygos:', finalPaymentUrl);

      console.log('[Lygos] 🔗 URL finale de paiement:', finalPaymentUrl);

      const result = {
        gateway_id: data.id,
        payment_url: finalPaymentUrl,
        status: 'created',
        expires_at: data.creation_date
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

      // Selon la doc Lygos, utiliser GET /v1/gateway pour lister et trouver notre gateway
      const response = await fetch(`${baseUrl}/v1/gateway`, {
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
          throw new Error('Réponse Lygos invalide');
        }

        console.log('[Lygos] 📋 Liste des gateways:', data);

        // Chercher notre gateway dans la liste
        const gateway = Array.isArray(data)
          ? data.find(g => g.id === gatewayIdOrOrderId || g.order_id === gatewayIdOrOrderId)
          : null;

        if (gateway) {
          return {
            order_id: gateway.order_id || gatewayIdOrOrderId,
            status: 'pending', // Lygos ne semble pas avoir de statut de paiement dans la liste
            amount: gateway.amount,
            currency: gateway.currency || 'XOF',
            transaction_id: undefined,
            gateway_id: gateway.id,
            message: gateway.message || 'Gateway trouvé',
            created_at: gateway.creation_date,
            updated_at: gateway.creation_date
          };
        }
      }

      // Si pas trouvé, retourner un statut par défaut
      console.warn('[Lygos] ⚠️ Gateway non trouvé dans la liste');

      return {
        order_id: gatewayIdOrOrderId,
        status: 'pending', // Statut par défaut
        amount: 0,
        currency: 'XOF',
        transaction_id: undefined,
        gateway_id: gatewayIdOrOrderId,
        message: `Impossible de vérifier le statut: Gateway non trouvé`,
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