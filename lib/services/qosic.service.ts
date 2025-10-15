import { BaseService } from './base.service';

/**
 * Interface pour créer une transaction Qosic (Checkout)
 */
export interface CreateQosicCheckoutInput {
  amount: number; // Montant en XOF
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
  transref: string; // Référence unique de la transaction
  returnUrl: string; // URL de retour après paiement
  type?: 'all' | 'mobile' | 'card'; // Type de paiement (par défaut: all)
}

/**
 * Réponse de Qosic après initialisation
 */
export interface QosicCheckoutResponse {
  url: string; // URL de redirection pour le paiement
  transref: string; // Référence de la transaction
  status?: string;
}

/**
 * Statut d'une transaction Qosic
 */
export interface QosicTransactionStatus {
  transref: string;
  status: string; // success, pending, failed, etc.
  amount?: number;
  message?: string;
  [key: string]: any; // Autres champs possibles
}

/**
 * Service pour gérer les paiements avec Qosic
 */
export class QosicService extends BaseService {
  /**
   * Récupérer l'URL d'initialisation selon le mode
   */
  private static getInitUrl(): string {
    const mode = process.env.QOSIC_MODE || 'test';
    
    if (process.env.QOSIC_INIT_URL) {
      return process.env.QOSIC_INIT_URL;
    }
    
    return mode === 'live'
      ? 'https://b-card.qosic.net/public/v1/initTransaction'
      : 'http://74.208.84.251:9014/public/v1/initTransaction';
  }

  /**
   * Récupérer l'URL de vérification de statut
   */
  private static getStatusUrl(): string {
    return process.env.QOSIC_STATUS_URL || 'https://api.qosic.net/QosicBrigde/checkout/v1/status';
  }

  /**
   * Récupérer la clé Qosic
   */
  private static getQosKey(): string {
    const qosKey = process.env.QOSIC_QOSKEY;
    if (!qosKey) {
      throw new Error('QOSIC_QOSKEY est manquant dans les variables d\'environnement');
    }
    return qosKey;
  }

  /**
   * Initialiser une transaction de checkout Qosic
   */
  static async initCheckout(input: CreateQosicCheckoutInput): Promise<QosicCheckoutResponse> {
    try {
      const initUrl = this.getInitUrl();
      const qosKey = this.getQosKey();

      // Préparer le payload selon la doc Qosic
      const payload = {
        type: input.type || 'all', // all = mobile money + carte
        transref: input.transref,
        qosKey: qosKey,
        returnUrl: input.returnUrl,
        amountDetails: {
          totalAmount: Math.round(input.amount),
          currency: 'XOF'
        },
        saleDetails: {
          firstName: input.customer.firstName,
          lastName: input.customer.lastName,
          middleName: '',
          nameSuffix: '',
          title: 'Mr',
          address1: input.customer.address || 'Cotonou',
          address2: '',
          address4: '',
          locality: input.customer.city || 'Littoral',
          administrativeArea: '',
          postalCode: input.customer.postalCode || '229',
          country: input.customer.country || 'Benin',
          district: 'BJ',
          buildingNumber: '',
          email: input.customer.email,
          emailDomain: '',
          phoneNumber: input.customer.phone,
          phoneType: 'cel'
        }
      };

      console.log('[Qosic] Initialisation transaction:', { transref: input.transref, amount: input.amount });

      const response = await fetch(initUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Qosic] Erreur initialisation:', errorText);
        throw new Error(`Qosic API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.url) {
        console.error('[Qosic] Réponse invalide:', data);
        throw new Error('Qosic n\'a pas retourné d\'URL de paiement');
      }

      console.log('[Qosic] Transaction initialisée avec succès:', data.url);

      return {
        url: data.url,
        transref: input.transref,
        status: data.status
      };
    } catch (error: any) {
      console.error('[Qosic] Erreur lors de l\'initialisation:', error);
      throw new Error(error.message || 'Échec de l\'initialisation du paiement Qosic');
    }
  }

  /**
   * Vérifier le statut d'une transaction Qosic
   */
  static async getTransactionStatus(transref: string): Promise<QosicTransactionStatus> {
    try {
      const statusUrl = this.getStatusUrl();
      const qosKey = this.getQosKey();

      console.log('[Qosic] Vérification statut transaction:', transref);

      const response = await fetch(statusUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qoskey: qosKey,
          transref: transref
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Qosic] Erreur vérification statut:', errorText);
        throw new Error(`Qosic status API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      console.log('[Qosic] Statut reçu:', data);

      return {
        transref: transref,
        status: data.status || data.transactionStatus || 'unknown',
        amount: data.amount,
        message: data.message || data.responseMessage,
        ...data
      };
    } catch (error: any) {
      console.error('[Qosic] Erreur lors de la vérification du statut:', error);
      throw new Error(error.message || 'Échec de la vérification du statut Qosic');
    }
  }

  /**
   * Vérifier si le paiement est réussi selon le statut
   */
  static isPaymentSuccessful(status: string): boolean {
    const successStatuses = ['success', 'successful', 'completed', 'paid', '00'];
    return successStatuses.includes(status.toLowerCase());
  }

  /**
   * Vérifier si le paiement a échoué selon le statut
   */
  static isPaymentFailed(status: string): boolean {
    const failedStatuses = ['failed', 'error', 'cancelled', 'canceled', 'rejected', '-1'];
    return failedStatuses.includes(status.toLowerCase());
  }

  /**
   * Vérifier si le paiement est en attente selon le statut
   */
  static isPaymentPending(status: string): boolean {
    const pendingStatuses = ['pending', 'processing', '1'];
    return pendingStatuses.includes(status.toLowerCase());
  }
}
