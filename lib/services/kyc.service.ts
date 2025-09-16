import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';

export interface KYCProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  occupation: string;
  annual_income?: string;
  source_of_funds: string;
  purpose_of_account: string;
  risk_level: 'low' | 'medium' | 'high';
  status: 'incomplete' | 'pending' | 'approved' | 'rejected' | 'requires_update';
  completed_at?: string;
  approved_at?: string;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessKYC {
  id: string;
  user_id: string;
  business_name: string;
  business_type: 'sole_proprietorship' | 'partnership' | 'corporation' | 'llc' | 'ngo';
  registration_number: string;
  tax_id: string;
  business_address: string;
  industry: string;
  annual_revenue?: string;
  number_of_employees?: number;
  website?: string;
  status: 'incomplete' | 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface KYCDocument {
  id: string;
  kyc_profile_id: string;
  document_type: 'identity' | 'address' | 'income' | 'business_registration' | 'tax_certificate';
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  verified_at?: string;
  rejected_reason?: string;
  created_at: string;
}

export interface CreateKYCProfileData {
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  occupation: string;
  annual_income?: string;
  source_of_funds: string;
  purpose_of_account: string;
}

export interface CreateBusinessKYCData {
  user_id: string;
  business_name: string;
  business_type: BusinessKYC['business_type'];
  registration_number: string;
  tax_id: string;
  business_address: string;
  industry: string;
  annual_revenue?: string;
  number_of_employees?: number;
  website?: string;
}

export class KYCService extends BaseService {
  /**
   * Créer un profil KYC personnel
   */
  static async createPersonalKYC(data: CreateKYCProfileData): Promise<ServiceResponse<KYCProfile | null>> {
    try {
      const riskLevel = this.calculateRiskLevel(data);
      
      const supabaseClient = this.getSupabaseClient() as any;
      const { data: profile, error } = await supabaseClient
        .from('kyc_profiles')
        .insert({
          ...data,
          risk_level: riskLevel,
          status: 'incomplete'
        })
        .select()
        .single();

      if (error) throw error;

      return this.createResponse(profile as KYCProfile);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Créer un profil KYC business
   */
  static async createBusinessKYC(data: CreateBusinessKYCData): Promise<ServiceResponse<BusinessKYC | null>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { data: profile, error } = await supabaseClient
        .from('business_kyc')
        .insert({
          ...data,
          status: 'incomplete'
        })
        .select()
        .single();

      if (error) throw error;

      return this.createResponse(profile as BusinessKYC);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer le profil KYC d'un utilisateur
   */
  static async getUserKYC(userId: string): Promise<ServiceResponse<{
    personal?: KYCProfile;
    business?: BusinessKYC;
    documents: KYCDocument[];
  }>> {
    try {
      // Récupérer le profil personnel
      const { data: personal } = await this.getSupabaseClient()
        .from('kyc_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Récupérer le profil business
      const { data: business } = await this.getSupabaseClient()
        .from('business_kyc')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Récupérer les documents
      const { data: documents } = await this.getSupabaseClient()
        .from('kyc_documents')
        .select('*')
        .eq('kyc_profile_id', (personal as any)?.id || (business as any)?.id)
        .order('created_at', { ascending: false });

      return this.createResponse({
        personal: (personal ? (personal as KYCProfile) : undefined),
        business: (business ? (business as BusinessKYC) : undefined),
        documents: (documents as KYCDocument[]) || []
      });
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Soumettre le KYC pour révision
   */
  static async submitForReview(userId: string, type: 'personal' | 'business'): Promise<ServiceResponse<boolean>> {
    try {
      const table = type === 'personal' ? 'kyc_profiles' : 'business_kyc';
      
      const supabaseClient = this.getSupabaseClient() as any;
      const { error } = await supabaseClient
        .from(table)
        .update({
          status: 'pending',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Approuver un KYC
   */
  static async approveKYC(
    profileId: string, 
    type: 'personal' | 'business',
    adminId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const table = type === 'personal' ? 'kyc_profiles' : 'business_kyc';
      
      const supabaseClient = this.getSupabaseClient() as any;
      const { error } = await supabaseClient
        .from(table)
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) throw error;

      // Enregistrer l'action d'approbation
      await this.logKYCAction(profileId, 'approved', adminId);

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Rejeter un KYC
   */
  static async rejectKYC(
    profileId: string,
    type: 'personal' | 'business',
    reason: string,
    adminId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const table = type === 'personal' ? 'kyc_profiles' : 'business_kyc';
      
      const supabaseClient = this.getSupabaseClient() as any;
      const { error } = await supabaseClient
        .from(table)
        .update({
          status: 'rejected',
          rejected_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) throw error;

      // Enregistrer l'action de rejet
      await this.logKYCAction(profileId, 'rejected', adminId, reason);

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Récupérer les KYC en attente de révision
   */
  static async getPendingKYC(
    type: 'personal' | 'business' | 'all' = 'all',
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<KYCProfile | BusinessKYC>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query;
      if (type === 'personal') {
        query = this.getSupabaseClient()
          .from('kyc_profiles')
          .select('*', { count: 'exact' });
      } else if (type === 'business') {
        query = this.getSupabaseClient()
          .from('business_kyc')
          .select('*', { count: 'exact' });
      } else {
        // Pour 'all', on récupère les deux types (implémentation simplifiée)
        query = this.getSupabaseClient()
          .from('kyc_profiles')
          .select('*', { count: 'exact' });
      }

      const { data, error, count } = await query
        .eq('status', 'pending')
        .order('completed_at', { ascending: true })
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
   * Ajouter un document KYC
   */
  static async addDocument(
    kycProfileId: string,
    documentType: KYCDocument['document_type'],
    documentUrl: string
  ): Promise<ServiceResponse<KYCDocument | null>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { data, error } = await supabaseClient
        .from('kyc_documents')
        .insert({
          kyc_profile_id: kycProfileId,
          document_type: documentType,
          document_url: documentUrl,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return this.createResponse(data as KYCDocument);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Calculer le niveau de risque
   */
  private static calculateRiskLevel(data: CreateKYCProfileData): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // Facteurs de risque basiques
    if (data.annual_income && parseInt(data.annual_income) > 100000) riskScore += 1;
    if (data.source_of_funds.includes('crypto') || data.source_of_funds.includes('gambling')) riskScore += 2;
    if (data.purpose_of_account.includes('investment') || data.purpose_of_account.includes('trading')) riskScore += 1;

    // Pays à haut risque (exemple simplifié)
    const highRiskCountries = ['AF', 'IR', 'KP', 'SY'];
    if (highRiskCountries.includes(data.nationality)) riskScore += 3;

    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  /**
   * Enregistrer une action KYC
   */
  private static async logKYCAction(
    profileId: string,
    action: string,
    adminId: string,
    notes?: string
  ): Promise<void> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      await supabaseClient
        .from('kyc_actions')
        .insert({
          kyc_profile_id: profileId,
          action,
          admin_id: adminId,
          notes,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'action KYC:', error);
    }
  }

  /**
   * Récupérer les statistiques KYC
   */
  static async getKYCStats(): Promise<ServiceResponse<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    incomplete: number;
    highRisk: number;
  }>> {
    try {
      const { data: stats, error } = await this.getSupabaseClient()
        .rpc('get_kyc_statistics');

      if (error) throw error;

      return this.createResponse(stats || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        incomplete: 0,
        highRisk: 0
      });
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }
}