import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';

export interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: 'login' | 'logout' | 'password_change' | 'failed_login' | 'suspicious_activity' | 'account_locked' | 'two_fa_enabled' | 'two_fa_disabled';
  ip_address: string;
  user_agent: string;
  location?: string;
  risk_score: number;
  status: 'normal' | 'suspicious' | 'blocked';
  metadata?: any;
  created_at: string;
}

export interface SecuritySettings {
  id: string;
  user_id: string;
  two_factor_enabled: boolean;
  two_factor_method: 'sms' | 'email' | 'authenticator' | null;
  login_notifications: boolean;
  suspicious_activity_alerts: boolean;
  session_timeout: number; // en minutes
  max_failed_attempts: number;
  account_locked_until?: string;
  password_last_changed: string;
  created_at: string;
  updated_at: string;
}

export interface LoginAttempt {
  id: string;
  user_id?: string;
  email: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  failure_reason?: string;
  risk_score: number;
  location?: string;
  created_at: string;
}

export interface TwoFactorSetup {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

export interface DeviceInfo {
  id: string;
  user_id: string;
  device_name: string;
  device_type: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  ip_address: string;
  is_trusted: boolean;
  last_used: string;
  created_at: string;
}

export class SecurityService extends BaseService {
  /**
   * Enregistrer un événement de sécurité
   */
  static async logSecurityEvent(
    userId: string,
    eventType: SecurityEvent['event_type'],
    ipAddress: string,
    userAgent: string,
    metadata?: any
  ): Promise<ServiceResponse<SecurityEvent | null>> {
    try {
      const riskScore = await this.calculateRiskScore(userId, eventType, ipAddress);
      const location = await this.getLocationFromIP(ipAddress);
      
      const supabaseClient = this.getSupabaseClient() as any;
      const { data, error } = await supabaseClient
        .from('security_events')
        .insert({
          user_id: userId,
          event_type: eventType,
          ip_address: ipAddress,
          user_agent: userAgent,
          location,
          risk_score: riskScore,
          status: riskScore > 70 ? 'suspicious' : 'normal',
          metadata
        })
        .select()
        .single();

      if (error) throw error;

      // Vérifier si des actions de sécurité sont nécessaires
      await this.checkSecurityActions(userId, riskScore, eventType);

      return this.createResponse(data as SecurityEvent);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer les paramètres de sécurité d'un utilisateur
   */
  static async getSecuritySettings(userId: string): Promise<ServiceResponse<SecuritySettings | null>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('security_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Créer des paramètres par défaut si ils n'existent pas
      if (!data) {
        return this.createDefaultSecuritySettings(userId);
      }

      return this.createResponse(data as SecuritySettings);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Mettre à jour les paramètres de sécurité
   */
  static async updateSecuritySettings(
    userId: string,
    settings: Partial<Omit<SecuritySettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<ServiceResponse<SecuritySettings | null>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { data, error } = await supabaseClient
        .from('security_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return this.createResponse(data as SecuritySettings);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Activer l'authentification à deux facteurs
   */
  static async enableTwoFactor(
    userId: string,
    method: 'sms' | 'email' | 'authenticator'
  ): Promise<ServiceResponse<TwoFactorSetup | null>> {
    try {
      let setup: TwoFactorSetup | null = null;

      if (method === 'authenticator') {
        // Générer un secret pour l'authenticator
        const secret = this.generateSecret();
        const qrCode = await this.generateQRCode(userId, secret);
        const backupCodes = this.generateBackupCodes();

        setup = { secret, qr_code: qrCode, backup_codes: backupCodes };

        // Sauvegarder le secret (chiffré)
        const supabaseClient = this.getSupabaseClient() as any;
        await supabaseClient
          .from('two_factor_secrets')
          .upsert({
            user_id: userId,
            secret: this.encryptSecret(secret),
            backup_codes: backupCodes.map(code => this.hashBackupCode(code)),
            method
          });
      }

      // Mettre à jour les paramètres de sécurité
      await this.updateSecuritySettings(userId, {
        two_factor_enabled: true,
        two_factor_method: method
      });

      // Enregistrer l'événement
      await this.logSecurityEvent(userId, 'two_fa_enabled', '', '', { method });

      return this.createResponse(setup);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Vérifier un code 2FA
   */
  static async verifyTwoFactor(
    userId: string,
    code: string,
    method: 'sms' | 'email' | 'authenticator' | 'backup'
  ): Promise<ServiceResponse<boolean>> {
    try {
      let isValid = false;

      switch (method) {
        case 'authenticator':
          isValid = await this.verifyTOTPCode(userId, code);
          break;
        case 'sms':
        case 'email':
          isValid = await this.verifyOTPCode(userId, code, method);
          break;
        case 'backup':
          isValid = await this.verifyBackupCode(userId, code);
          break;
      }

      return this.createResponse(isValid);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Enregistrer une tentative de connexion
   */
  static async logLoginAttempt(
    email: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    userId?: string,
    failureReason?: string
  ): Promise<ServiceResponse<LoginAttempt | null>> {
    try {
      const riskScore = await this.calculateLoginRiskScore(email, ipAddress, success);
      const location = await this.getLocationFromIP(ipAddress);

      const supabaseClient = this.getSupabaseClient() as any;
      const { data, error } = await supabaseClient
        .from('login_attempts')
        .insert({
          user_id: userId,
          email,
          ip_address: ipAddress,
          user_agent: userAgent,
          success,
          failure_reason: failureReason,
          risk_score: riskScore,
          location
        })
        .select()
        .single();

      if (error) throw error;

      // Vérifier les tentatives échouées consécutives
      if (!success && userId) {
        await this.checkFailedAttempts(userId, email);
      }

      return this.createResponse(data as LoginAttempt);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Verrouiller un compte
   */
  static async lockAccount(
    userId: string,
    reason: string,
    duration: number = 30 // minutes
  ): Promise<ServiceResponse<boolean>> {
    try {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + duration);

      await this.updateSecuritySettings(userId, {
        account_locked_until: lockedUntil.toISOString()
      });

      await this.logSecurityEvent(userId, 'account_locked', '', '', { reason, duration });

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Déverrouiller un compte
   */
  static async unlockAccount(userId: string, adminId?: string): Promise<ServiceResponse<boolean>> {
    try {
      await this.updateSecuritySettings(userId, {
        account_locked_until: null
      });

      await this.logSecurityEvent(userId, 'account_locked', '', '', { 
        action: 'unlocked',
        admin_id: adminId 
      });

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Récupérer les événements de sécurité d'un utilisateur
   */
  static async getUserSecurityEvents(
    userId: string,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<SecurityEvent>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      const { data, error, count } = await this.getSupabaseClient()
        .from('security_events')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const paginationInfo = this.calculatePagination(page, limit, total);

      return this.createPaginatedResponse((data as SecurityEvent[]) || [], paginationInfo);
    } catch (error) {
      return this.createPaginatedResponse([], {
        page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false
      }, this.handleError(error));
    }
  }

  /**
   * Récupérer les appareils de confiance
   */
  static async getTrustedDevices(userId: string): Promise<ServiceResponse<DeviceInfo[]>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('trusted_devices')
        .select('*')
        .eq('user_id', userId)
        .eq('is_trusted', true)
        .order('last_used', { ascending: false });

      if (error) throw error;

      return this.createResponse((data as DeviceInfo[]) || []);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Méthodes privées utilitaires
   */
  private static async calculateRiskScore(
    userId: string,
    eventType: string,
    ipAddress: string
  ): Promise<number> {
    let score = 0;

    // Score de base selon le type d'événement
    const eventScores = {
      'login': 10,
      'failed_login': 30,
      'password_change': 20,
      'suspicious_activity': 80,
      'logout': 5
    };

    score += eventScores[eventType as keyof typeof eventScores] || 0;

    // Vérifier l'historique des IP
    const { data: recentEvents } = await this.getSupabaseClient()
      .from('security_events')
      .select('ip_address')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const knownIPs = recentEvents?.map(e => e.ip_address) || [];
    if (!knownIPs.includes(ipAddress)) {
      score += 25; // Nouvelle IP
    }

    return Math.min(score, 100);
  }

  private static async calculateLoginRiskScore(
    email: string,
    ipAddress: string,
    success: boolean
  ): Promise<number> {
    let score = success ? 10 : 40;

    // Vérifier les tentatives récentes depuis cette IP
    const { data: recentAttempts } = await this.getSupabaseClient()
      .from('login_attempts')
      .select('success')
      .eq('ip_address', ipAddress)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    const failedCount = recentAttempts?.filter(a => !a.success).length || 0;
    score += failedCount * 10;

    return Math.min(score, 100);
  }

  private static async checkSecurityActions(
    userId: string,
    riskScore: number,
    eventType: string
  ): Promise<void> {
    if (riskScore > 80) {
      // Activité très suspecte - verrouiller le compte
      await this.lockAccount(userId, 'High risk activity detected', 60);
    } else if (riskScore > 60) {
      // Activité suspecte - envoyer une alerte
      // TODO: Envoyer notification à l'utilisateur
    }
  }

  private static async checkFailedAttempts(userId: string, email: string): Promise<void> {
    const { data: recentFailures } = await this.getSupabaseClient()
      .from('login_attempts')
      .select('id')
      .eq('user_id', userId)
      .eq('success', false)
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());

    if ((recentFailures?.length || 0) >= 5) {
      await this.lockAccount(userId, 'Too many failed login attempts', 30);
    }
  }

  private static async createDefaultSecuritySettings(userId: string): Promise<ServiceResponse<SecuritySettings | null>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { data, error } = await supabaseClient
        .from('security_settings')
        .insert({
          user_id: userId,
          two_factor_enabled: false,
          two_factor_method: null,
          login_notifications: true,
          suspicious_activity_alerts: true,
          session_timeout: 480, // 8 heures
          max_failed_attempts: 5,
          password_last_changed: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return this.createResponse(data as SecuritySettings);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  private static generateSecret(): string {
    // Générer un secret base32 pour TOTP
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  private static async generateQRCode(userId: string, secret: string): Promise<string> {
    // TODO: Implémenter la génération de QR code
    const issuer = 'YourMarketplace';
    const label = `${issuer}:${userId}`;
    const otpauth = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}`;
    return `data:image/png;base64,${Buffer.from(otpauth).toString('base64')}`;
  }

  private static generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }

  private static encryptSecret(secret: string): string {
    // TODO: Implémenter le chiffrement du secret
    return Buffer.from(secret).toString('base64');
  }

  private static hashBackupCode(code: string): string {
    // TODO: Implémenter le hachage des codes de sauvegarde
    return Buffer.from(code).toString('base64');
  }

  private static async verifyTOTPCode(userId: string, code: string): Promise<boolean> {
    // TODO: Implémenter la vérification TOTP
    return code.length === 6 && /^\d+$/.test(code);
  }

  private static async verifyOTPCode(userId: string, code: string, method: 'sms' | 'email'): Promise<boolean> {
    // TODO: Implémenter la vérification OTP
    return code.length === 6 && /^\d+$/.test(code);
  }

  private static async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    // TODO: Implémenter la vérification des codes de sauvegarde
    return code.length === 8;
  }

  private static async getLocationFromIP(ipAddress: string): Promise<string | undefined> {
    // TODO: Implémenter la géolocalisation par IP
    return 'Unknown';
  }
}