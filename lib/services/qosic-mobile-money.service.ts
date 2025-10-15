import { BaseService } from './base.service';

/**
 * Interface pour créer un paiement Mobile Money direct
 */
export interface CreateMobileMoneyPaymentInput {
  msisdn: string; // Numéro de téléphone (ex: 22967307747)
  amount: number; // Montant en XOF
  firstname?: string;
  lastname?: string;
  transref: string; // Référence unique de transaction
}

/**
 * Réponse de l'API Mobile Money
 */
export interface MobileMoneyPaymentResponse {
  success: boolean;
  transref: string;
  status?: string;
  message?: string;
  response_code?: string;
}

/**
 * Statut d'une transaction Mobile Money
 */
export interface MobileMoneyTransactionStatus {
  transref: string;
  status: string;
  response_code?: string;
  message?: string;
  amount?: number;
  msisdn?: string;
  [key: string]: any;
}

/**
 * Service pour gérer les paiements Mobile Money directs avec Qosic
 */
export class QosicMobileMoneyService extends BaseService {
  /**
   * Récupérer l'URL de base
   */
  private static getBaseUrl(): string {
    return process.env.QOSIC_MM_BASE_URL || 'http://staging.qosic.net:9010';
  }

  /**
   * Récupérer les credentials
   */
  private static getCredentials(): { username: string; password: string; clientId: string } {
    const username = process.env.QOSIC_MM_USERNAME;
    const password = process.env.QOSIC_MM_PASSWORD;
    const clientId = process.env.QOSIC_MM_CLIENT_ID;

    if (!username || !password || !clientId) {
      throw new Error('Credentials Qosic Mobile Money manquants (QOSIC_MM_USERNAME, QOSIC_MM_PASSWORD, QOSIC_MM_CLIENT_ID)');
    }

    return { username, password, clientId };
  }

  /**
   * Créer l'en-tête d'authentification Basic
   */
  private static getAuthHeader(): string {
    const { username, password } = this.getCredentials();
    const encoded = Buffer.from(`${username}:${password}`).toString('base64');
    return `Basic ${encoded}`;
  }

  /**
   * Créer un paiement Mobile Money
   */
  static async requestPayment(input: CreateMobileMoneyPaymentInput): Promise<MobileMoneyPaymentResponse> {
    try {
      const baseUrl = this.getBaseUrl();
      const { clientId } = this.getCredentials();

      // Valider le numéro de téléphone (doit être format international sans +)
      const msisdn = input.msisdn.replace(/[\s\+\-\(\)]/g, '');
      
      if (msisdn.length < 10 || msisdn.length > 15) {
        throw new Error('Numéro de téléphone invalide. Format attendu: 22967307747');
      }

      const payload = {
        msisdn: msisdn,
        amount: Math.round(input.amount).toString(),
        firstname: input.firstname || '',
        lastname: input.lastname || '',
        transref: input.transref,
        clientid: clientId
      };

      console.log('[Qosic MM] Demande de paiement:', { 
        msisdn: msisdn.substring(0, 6) + 'XXX', // Masquer les derniers chiffres
        amount: payload.amount, 
        transref: input.transref 
      });

      const response = await fetch(`${baseUrl}/QosicBridge/user/requestpayment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      
      console.log('[Qosic MM] Réponse brute:', { status: response.status, body: responseText });

      // HTTP 202 = Succès (selon la doc)
      if (response.status === 202) {
        let data: any = {};
        try {
          data = JSON.parse(responseText);
        } catch {
          // Si pas de JSON, on considère que c'est ok
        }

        return {
          success: true,
          transref: input.transref,
          status: data.status || data.response || '1', // 1 = PENDING
          message: 'Demande de paiement envoyée. Vérifiez votre téléphone.',
          response_code: data.response || data.response_code
        };
      }

      // HTTP 404 ou autre = Échec
      throw new Error(responseText || `Erreur API: ${response.status}`);

    } catch (error: any) {
      console.error('[Qosic MM] Erreur requestPayment:', error);
      throw new Error(error.message || 'Échec de la demande de paiement Mobile Money');
    }
  }

  /**
   * Vérifier le statut d'une transaction Mobile Money
   */
  static async getTransactionStatus(transref: string): Promise<MobileMoneyTransactionStatus> {
    try {
      const baseUrl = this.getBaseUrl();
      const { clientId } = this.getCredentials();

      console.log('[Qosic MM] Vérification statut:', transref);

      const response = await fetch(`${baseUrl}/QosicBridge/user/gettransactionstatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify({
          transref: transref,
          clientid: clientId
        }),
      });

      const responseText = await response.text();

      console.log('[Qosic MM] Réponse statut:', { status: response.status, body: responseText });

      if (!response.ok) {
        throw new Error(responseText || `Erreur API: ${response.status}`);
      }

      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        // Si pas de JSON valide
        data = { status: 'unknown', message: responseText };
      }

      return {
        transref: transref,
        status: data.response || data.status || 'unknown',
        response_code: data.response || data.response_code,
        message: data.response_message || data.message,
        amount: data.amount,
        msisdn: data.msisdn,
        ...data
      };

    } catch (error: any) {
      console.error('[Qosic MM] Erreur getTransactionStatus:', error);
      throw new Error(error.message || 'Échec de la vérification du statut');
    }
  }

  /**
   * Rembourser une transaction
   */
  static async refund(transref: string): Promise<MobileMoneyPaymentResponse> {
    try {
      const baseUrl = this.getBaseUrl();
      const { clientId } = this.getCredentials();

      console.log('[Qosic MM] Demande de remboursement:', transref);

      const response = await fetch(`${baseUrl}/QosicBridge/user/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify({
          transref: transref,
          clientid: clientId
        }),
      });

      const responseText = await response.text();

      console.log('[Qosic MM] Réponse remboursement:', { status: response.status, body: responseText });

      if (response.status === 202) {
        return {
          success: true,
          transref: transref,
          status: 'refunded',
          message: 'Remboursement en cours'
        };
      }

      throw new Error(responseText || `Erreur remboursement: ${response.status}`);

    } catch (error: any) {
      console.error('[Qosic MM] Erreur refund:', error);
      throw new Error(error.message || 'Échec du remboursement');
    }
  }

  /**
   * Vérifier si le paiement est réussi selon le code de réponse
   * Voir la doc: https://qosic.com/docs/ section "List of response code"
   */
  static isPaymentSuccessful(responseCode: string): boolean {
    // MTN BENIN: 00 = SUCCESS
    // MOOV AFRICA: 0 = SUCCESS
    const successCodes = ['00', '0', 'SUCCESS', 'SUCCESSFUL'];
    return successCodes.includes(responseCode?.toString().toUpperCase());
  }

  /**
   * Vérifier si le paiement a échoué
   */
  static isPaymentFailed(responseCode: string): boolean {
    const failedCodes = [
      '-1',        // FAILED (MTN)
      '92',        // Timeout (MOOV)
      '529',       // Low balance (MTN)
      '527',       // Network issue (MTN)
      '849',       // Validation failed (MTN)
      '515',       // Wrong network (MTN)
      '682',       // Internal error (MTN)
      '100',       // Transaction couldn't be completed (MTN)
      '8',         // Wrong PIN (MOOV)
      '10',        // Insufficient funds (MOOV)
      '7',         // Locked (MOOV)
      '30',        // Password error (MOOV)
      '4'          // Unauthorized (MOOV)
    ];
    return failedCodes.includes(responseCode?.toString());
  }

  /**
   * Vérifier si le paiement est en attente
   */
  static isPaymentPending(responseCode: string): boolean {
    // 1 = PENDING selon la doc
    return responseCode?.toString() === '1' || responseCode?.toString().toUpperCase() === 'PENDING';
  }

  /**
   * Obtenir un message d'erreur lisible selon le code de réponse
   */
  static getErrorMessage(responseCode: string): string {
    const errorMessages: Record<string, string> = {
      '-1': 'Paiement échoué ou timeout',
      '92': 'Timeout - Le paiement a expiré',
      '529': 'Solde insuffisant',
      '527': 'Erreur réseau - Réessayez',
      '849': 'Données invalides',
      '515': 'Numéro d\'un autre opérateur',
      '682': 'Erreur interne',
      '100': 'Transaction non complétée',
      '8': 'Code PIN incorrect',
      '10': 'Solde insuffisant',
      '7': 'Compte bloqué',
      '30': 'Erreur de mot de passe',
      '4': 'Accès non autorisé',
      '580': 'Montant trop élevé'
    };

    return errorMessages[responseCode?.toString()] || 'Erreur de paiement';
  }
}
