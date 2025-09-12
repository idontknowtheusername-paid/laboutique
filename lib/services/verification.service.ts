import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';

export interface VerificationDocument {
  id: string;
  user_id: string;
  document_type: 'id_card' | 'passport' | 'driver_license' | 'utility_bill' | 'bank_statement';
  document_url: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  verified_at?: string;
  rejected_reason?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserVerification {
  id: string;
  user_id: string;
  identity_verified: boolean;
  address_verified: boolean;
  phone_verified: boolean;
  email_verified: boolean;
  business_verified: boolean;
  verification_level: 'basic' | 'standard' | 'premium';
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationRequest {
  user_id: string;
  document_type: VerificationDocument['document_type'];
  document_url: string;
}

export interface PhoneVerification {
  phone: string;
  code: string;
  expires_at: string;
}

export class VerificationService extends BaseService {
  /**
   * Soumettre un document pour vérification
   */
  static async submitDocument(request: VerificationRequest): Promise<ServiceResponse<VerificationDocument | null>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { data, error } = await supabaseClient
        .from('verification_documents')
        .insert({
          user_id: request.user_id,
          document_type: request.document_type,
          document_url: request.document_url,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return this.createResponse(data as VerificationDocument);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer le statut de vérification d'un utilisateur
   */
  static async getUserVerificationStatus(userId: string): Promise<ServiceResponse<UserVerification | null>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('user_verifications')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return this.createResponse(data as UserVerification);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Vérifier un numéro de téléphone
   */
  static async verifyPhone(userId: string, phone: string, code: string): Promise<ServiceResponse<boolean>> {
    try {
      // Vérifier le code
      const { data: verification, error: verifyError } = await this.getSupabaseClient()
        .from('phone_verifications')
        .select('*')
        .eq('phone', phone)
        .eq('code', code)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (verifyError || !verification) {
        return this.createResponse(false, 'Code invalide ou expiré');
      }

      // Mettre à jour le statut de vérification
      const supabaseClient = this.getSupabaseClient() as any;
      await supabaseClient
        .from('user_verifications')
        .upsert({
          user_id: userId,
          phone_verified: true,
          updated_at: new Date().toISOString()
        });

      // Supprimer le code de vérification
      await supabaseClient
        .from('phone_verifications')
        .delete()
        .eq('phone', phone);

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Envoyer un code de vérification SMS
   */
  static async sendPhoneVerificationCode(phone: string): Promise<ServiceResponse<boolean>> {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expire dans 10 minutes

      const supabaseClient = this.getSupabaseClient() as any;
      await supabaseClient
        .from('phone_verifications')
        .upsert({
          phone,
          code,
          expires_at: expiresAt.toISOString()
        });

      // TODO: Intégrer avec un service SMS (Twilio, etc.)
      console.log(`Code de vérification pour ${phone}: ${code}`);

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Approuver un document de vérification
   */
  static async approveDocument(documentId: string, adminId: string): Promise<ServiceResponse<boolean>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { error } = await supabaseClient
        .from('verification_documents')
        .update({
          status: 'approved',
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;

      // Mettre à jour le niveau de vérification de l'utilisateur
      await this.updateUserVerificationLevel(documentId);

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Rejeter un document de vérification
   */
  static async rejectDocument(
    documentId: string, 
    reason: string, 
    adminId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { error } = await supabaseClient
        .from('verification_documents')
        .update({
          status: 'rejected',
          rejected_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Récupérer les documents en attente de vérification
   */
  static async getPendingDocuments(
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<VerificationDocument>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      const { data, error, count } = await this.getSupabaseClient()
        .from('verification_documents')
        .select('*', { count: 'exact' })
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const paginationInfo = this.calculatePagination(page, limit, total);

      return this.createPaginatedResponse((data as VerificationDocument[]) || [], paginationInfo);
    } catch (error) {
      return this.createPaginatedResponse([], {
        page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false
      }, this.handleError(error));
    }
  }

  /**
   * Mettre à jour le niveau de vérification d'un utilisateur
   */
  private static async updateUserVerificationLevel(documentId: string): Promise<void> {
    try {
      // Récupérer le document et l'utilisateur
      const { data: document } = await this.getSupabaseClient()
        .from('verification_documents')
        .select('user_id, document_type')
        .eq('id', documentId)
        .single();

      if (!document) return;

      // Récupérer tous les documents approuvés de l'utilisateur
      const { data: approvedDocs } = await this.getSupabaseClient()
        .from('verification_documents')
        .select('document_type')
        .eq('user_id', document.user_id)
        .eq('status', 'approved');

      const docTypes = approvedDocs?.map(doc => doc.document_type) || [];
      
      let verificationLevel: 'basic' | 'standard' | 'premium' = 'basic';
      let identityVerified = false;
      let addressVerified = false;

      // Déterminer le niveau de vérification
      if (docTypes.includes('id_card') || docTypes.includes('passport') || docTypes.includes('driver_license')) {
        identityVerified = true;
        verificationLevel = 'standard';
      }

      if (docTypes.includes('utility_bill') || docTypes.includes('bank_statement')) {
        addressVerified = true;
      }

      if (identityVerified && addressVerified) {
        verificationLevel = 'premium';
      }

      // Mettre à jour le statut de vérification
      const supabaseClient = this.getSupabaseClient() as any;
      await supabaseClient
        .from('user_verifications')
        .upsert({
          user_id: document.user_id,
          identity_verified: identityVerified,
          address_verified: addressVerified,
          verification_level: verificationLevel,
          verified_at: identityVerified ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du niveau de vérification:', error);
    }
  }
}