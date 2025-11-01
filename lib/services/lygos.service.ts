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
 * Réponse complète de Lygos après création de la passerelle
 * Selon la documentation officielle
 */
export interface LygosGatewayResponse {
  gateway_id: string; // ID de la passerelle créée (mapping de 'id')
  payment_url: string; // URL de redirection pour le paiement (mapping de 'link')
  status: string; // Statut de la passerelle
  expires_at?: string; // Date d'expiration (mapping de 'creation_date')
  
  // Champs additionnels de la vraie réponse API
  amount?: number;
  currency?: string;
  shop_name?: string;
  user_id?: string;
  message?: string;
  order_id?: string;
  success_url?: string;
  failure_url?: string;
}

/**
 * Statut d'un paiement Lygos
 * Selon GET /v1/gateway/payin/{order_id}
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
 * Réponse brute de l'API Lygos pour la création de gateway
 */
interface LygosApiGatewayResponse {
  id: string;
  amount: number;
  currency: string;
  shop_name: string;
  user_id: string;
  creation_date: string;
  link: string;
  message: string | null;
  order_id: string | null;
  success_url: string | null;
  failure_url: string | null;
}

/**
 * Réponse brute de l'API Lygos pour le statut payin
 */
interface LygosApiPayinResponse {
  order_id: string;
  status: string;
}

/**
 * Service pour gérer les paiements avec Lygos
 * Conforme à la documentation officielle Lygos API v1
 */
export class LygosService extends BaseService {
  /**
   * Récupérer l'URL de base de l'API
   */
  private static getBaseUrl(): string {
    const mode = process.env.LYGOS_MODE || 'production';
    
    if (process.env.LYGOS_API_URL) {
      return process.env.LYGOS_API_URL;
    }
    
    // ✅ CORRECTION : Selon la doc officielle Lygos
    return 'https://api.lygosapp.com/v1';
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
   * Selon la doc: api-key et Content-Type requis
   */
  private static getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'api-key': this.getApiKey(),
    };
  }

  /**
   * Gérer les erreurs HTTP selon la documentation Lygos
   */
  private static handleHttpError(status: number, responseText: string): never {
    const errorMessages: Record<number, string> = {
      400: 'Requête incorrecte - Vérifier les champs obligatoires',
      401: 'Non autorisé - API Key manquante ou invalide',
      403: 'Interdit - API Key invalide ou permissions insuffisantes',
      404: 'Ressource non trouvée',
      409: 'Conflit - Ressource en double',
      422: 'Données invalides',
      500: 'Erreur serveur interne',
      502: 'Mauvaise passerelle - Service temporairement indisponible',
      503: 'Service indisponible - Maintenance ou surcharge',
      504: 'Délai d\'attente dépassé',
    };

    const errorMessage = errorMessages[status] || `Erreur HTTP ${status}`;
    
    console.error(`[Lygos] ❌ ${errorMessage}:`, responseText);
    
    // Essayer de parser l'erreur structurée de Lygos
    try {
      const errorData = JSON.parse(responseText);
      if (errorData.detail?.message) {
        throw new Error(`Lygos API: ${errorData.detail.message} (${errorData.detail.type || status})`);
      }
      if (errorData.message) {
        throw new Error(`Lygos API: ${errorData.message} (Status: ${status})`);
      }
    } catch (parseError) {
      // Si pas de structure d'erreur, utiliser le message générique
      console.warn('[Lygos] ⚠️ Impossible de parser l\'erreur JSON:', parseError);
    }
    
    // Ajouter des conseils selon le type d'erreur
    let advice = '';
    if (status === 403) {
      advice = ' | Vérifiez votre API Key Lygos dans les variables d\'environnement';
    } else if (status === 401) {
      advice = ' | API Key manquante ou expirée';
    }

    throw new Error(`${errorMessage}: ${responseText}${advice}`);
  }

  /**
   * Créer une passerelle de paiement Lygos
   * Endpoint: POST /v1/gateway
   */
  static async createGateway(input: CreateLygosGatewayInput): Promise<LygosGatewayResponse> {
    try {
      const baseUrl = this.getBaseUrl();
      
      // ✅ FALLBACK DÉVELOPPEMENT : Si pas d'API Key, simuler une réponse
      const apiKey = process.env.LYGOS_API_KEY;
      if (!apiKey && process.env.NODE_ENV === 'development') {
        console.warn('[Lygos] ⚠️ Mode développement - Simulation gateway');
        return {
          gateway_id: `dev-${Date.now()}`,
          payment_url: `http://localhost:3000/checkout/dev-${Date.now()}?order_id=${input.orderId}`,
          status: 'created',
          amount: input.amount,
          currency: 'XOF',
          shop_name: 'JomionStore',
          message: 'Gateway simulée pour développement'
        };
      }

      // Payload selon la documentation officielle Lygos
      const payload = {
        amount: Math.round(input.amount), // Montant en FCFA (integer requis)
        shop_name: 'JomionStore', // string requis
        order_id: input.orderId, // string requis
        message: input.description || `Commande JomionStore ${input.orderId}`, // string optionnel
        success_url: input.returnUrl, // string optionnel
        failure_url: input.returnUrl // string optionnel
      };

      console.log('[Lygos] 🚀 Création passerelle de paiement:', {
        order_id: input.orderId,
        amount: input.amount,
        shop_name: payload.shop_name
      });

      // POST /v1/gateway selon la documentation
      const response = await fetch(`${baseUrl}/gateway`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('[Lygos] 📥 Réponse brute:', responseText.substring(0, 200));

      // Gérer les erreurs HTTP
      if (!response.ok) {
        this.handleHttpError(response.status, responseText);
      }

      // Parser la réponse JSON
      let data: LygosApiGatewayResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[Lygos] ❌ Erreur parsing JSON:', parseError);
        throw new Error('Réponse Lygos invalide (pas du JSON)');
      }
      
      console.log('[Lygos] 📋 Réponse parsée:', {
        id: data.id,
        order_id: data.order_id,
        amount: data.amount,
        link: data.link
      });

      // 🔍 LOG CRITIQUE pour diagnostiquer le problème
      console.log('[Lygos] 🔍 VALEUR EXACTE de data.link:', data.link);

      // Valider la présence des champs essentiels
      if (!data.id) {
        console.error('[Lygos] ❌ ID manquant dans la réponse:', data);
        throw new Error('Lygos n\'a pas retourné d\'ID de passerelle valide');
      }

      if (!data.link) {
        console.error('[Lygos] ❌ Link manquant dans la réponse:', data);
        throw new Error('Lygos n\'a pas retourné de lien de paiement');
      }

      // ✅ CORRECTION : Utiliser l'URL telle que fournie par Lygos
      // Lygos retourne des URLs vers NOTRE site, pas vers checkout.lygosapp.com
      const finalPaymentUrl = data.link.startsWith('http')
        ? data.link
        : `https://${data.link}`;

      console.log('[Lygos] 🔗 URL de paiement générée:', finalPaymentUrl);

      // Mapper la réponse API vers notre interface
      const result: LygosGatewayResponse = {
        gateway_id: data.id,
        payment_url: finalPaymentUrl,
        status: 'created',
        expires_at: data.creation_date,
        amount: data.amount,
        currency: data.currency,
        shop_name: data.shop_name,
        user_id: data.user_id,
        message: data.message || undefined,
        order_id: data.order_id || undefined,
        success_url: data.success_url || undefined,
        failure_url: data.failure_url || undefined
      };

      console.log('[Lygos] ✅ Passerelle créée avec succès');

      return result;
    } catch (error: any) {
      console.error('[Lygos] 💥 Erreur création passerelle:', error.message);
      throw new Error(error.message || 'Échec de la création de la passerelle Lygos');
    }
  }

  /**
   * Vérifier le statut d'un paiement Lygos
   * Endpoint: GET /v1/gateway/payin/{order_id}
   * 
   * CORRECTION: Utilisation du bon endpoint selon la documentation
   */
  static async getPaymentStatus(orderId: string): Promise<LygosPaymentStatus> {
    try {
      const baseUrl = this.getBaseUrl();

      console.log('[Lygos] 🔍 Vérification statut paiement:', orderId);

      // ✅ CORRECTION: Utiliser le BON endpoint selon la doc
      // GET /v1/gateway/payin/{order_id}
      const response = await fetch(`${baseUrl}/gateway/payin/${orderId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const responseText = await response.text();
      console.log('[Lygos] 📥 Réponse statut brute:', responseText);

      // Gérer les erreurs HTTP
      if (!response.ok) {
        console.error('[Lygos] ❌ Erreur HTTP statut:', response.status, responseText);
        
        // Si 404, le paiement n'existe pas ou n'est pas encore traité
        if (response.status === 404) {
          return {
            order_id: orderId,
            status: 'not_found',
            message: 'Paiement non trouvé ou pas encore traité',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        
        this.handleHttpError(response.status, responseText);
      }

      // Parser la réponse selon la doc: { "order_id": "<string>", "status": "<string>" }
      let data: LygosApiPayinResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[Lygos] ❌ Erreur parsing statut:', parseError);
        throw new Error('Réponse Lygos invalide');
      }

      console.log('[Lygos] 📊 Statut reçu:', data.status, 'pour order_id:', data.order_id);

      // Mapper la réponse vers notre interface
      const result: LygosPaymentStatus = {
        order_id: data.order_id || orderId,
        status: data.status || 'unknown',
        currency: 'XOF',
        message: `Statut: ${data.status}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('[Lygos] ✅ Statut vérifié avec succès');

      return result;
    } catch (error: any) {
      console.error('[Lygos] 💥 Erreur vérification statut:', error.message);

      // Retourner un statut d'erreur plutôt que de lever une exception
      return {
        order_id: orderId,
        status: 'error',
        currency: 'XOF',
        message: error.message || 'Erreur de vérification du statut',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  /**
   * Récupérer les détails d'une passerelle spécifique
   * Endpoint: GET /v1/gateway/{gateway_id}
   */
  static async getGatewayDetails(gatewayId: string): Promise<any> {
    try {
      const baseUrl = this.getBaseUrl();

      console.log('[Lygos] 🔍 Récupération détails gateway:', gatewayId);

      const response = await fetch(`${baseUrl}/gateway/${gatewayId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const responseText = await response.text();

      if (!response.ok) {
        this.handleHttpError(response.status, responseText);
      }

      const data = JSON.parse(responseText);
      console.log('[Lygos] 📋 Détails gateway récupérés');

      return data;
    } catch (error: any) {
      console.error('[Lygos] 💥 Erreur récupération détails:', error.message);
      throw error;
    }
  }

  /**
   * Lister toutes les passerelles de paiement
   * Endpoint: GET /v1/gateway
   */
  static async listGateways(): Promise<LygosApiGatewayResponse[]> {
    try {
      const baseUrl = this.getBaseUrl();

      console.log('[Lygos] 📋 Liste des gateways...');

      const response = await fetch(`${baseUrl}/gateway`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const responseText = await response.text();

      if (!response.ok) {
        this.handleHttpError(response.status, responseText);
      }

      const data = JSON.parse(responseText);
      console.log('[Lygos] 📊 Nombre de gateways:', Array.isArray(data) ? data.length : 'N/A');

      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('[Lygos] 💥 Erreur liste gateways:', error.message);
      throw error;
    }
  }

  /**
   * Mettre à jour une passerelle de paiement
   * Endpoint: PUT /v1/gateway/{gateway_id}
   */
  static async updateGateway(
    gatewayId: string,
    updates: {
      amount?: number;
      shop_name?: string;
      message?: string;
      success_url?: string;
      failure_url?: string;
    }
  ): Promise<any> {
    try {
      const baseUrl = this.getBaseUrl();

      console.log('[Lygos] 🔄 Mise à jour gateway:', gatewayId);

      const response = await fetch(`${baseUrl}/gateway/${gatewayId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });

      const responseText = await response.text();

      if (!response.ok) {
        this.handleHttpError(response.status, responseText);
      }

      const data = JSON.parse(responseText);
      console.log('[Lygos] ✅ Gateway mis à jour');

      return data;
    } catch (error: any) {
      console.error('[Lygos] 💥 Erreur mise à jour:', error.message);
      throw error;
    }
  }

  /**
   * Supprimer une passerelle de paiement
   * Endpoint: DELETE /v1/gateway/{gateway_id}
   */
  static async deleteGateway(gatewayId: string): Promise<boolean> {
    try {
      const baseUrl = this.getBaseUrl();

      console.log('[Lygos] 🗑️ Suppression gateway:', gatewayId);

      const response = await fetch(`${baseUrl}/gateway/${gatewayId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const responseText = await response.text();
        this.handleHttpError(response.status, responseText);
      }

      console.log('[Lygos] ✅ Gateway supprimé');

      return true;
    } catch (error: any) {
      console.error('[Lygos] 💥 Erreur suppression:', error.message);
      throw error;
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
   * CORRECTION: Utiliser un endpoint qui existe réellement
   */
  static async testConfiguration(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const baseUrl = this.getBaseUrl();
      const apiKey = this.getApiKey();

      console.log('[Lygos] 🧪 Test de configuration...');
      console.log('[Lygos] 🔗 Base URL:', baseUrl);
      console.log('[Lygos] 🔑 API Key présente:', !!apiKey);

      // ✅ CORRECTION: Utiliser GET /v1/gateway qui existe dans la doc
      // (au lieu de /v1/ping qui n'existe pas)
      const response = await fetch(`${baseUrl}/gateway`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const responseText = await response.text();

      if (response.ok) {
        const gateways = JSON.parse(responseText);
        return {
          success: true,
          message: '✅ Configuration Lygos valide - API Key fonctionnelle',
          details: {
            status: response.status,
            message: 'Connexion API réussie',
            gateways_count: Array.isArray(gateways) ? gateways.length : 'N/A'
          }
        };
      } else if (response.status === 401) {
        return {
          success: false,
          message: '❌ API Key invalide ou manquante',
          details: { status: 401, error: 'Unauthorized', response: responseText }
        };
      } else if (response.status === 403) {
        return {
          success: false,
          message: '❌ Permissions insuffisantes',
          details: { status: 403, error: 'Forbidden', response: responseText }
        };
      } else {
        return {
          success: false,
          message: `❌ Erreur API Lygos: ${response.status}`,
          details: { status: response.status, response: responseText }
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Erreur de connexion Lygos: ${error.message}`,
        details: { error: error.message }
      };
    }
  }
}