import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  refresh_token?: string;
  ip_address: string;
  user_agent: string;
  device_info: {
    browser: string;
    os: string;
    device: string;
    is_mobile: boolean;
  };
  location?: string;
  is_active: boolean;
  last_activity: string;
  expires_at: string;
  created_at: string;
}

export interface SessionActivity {
  id: string;
  session_id: string;
  activity_type: 'page_view' | 'api_call' | 'action' | 'idle';
  page_url?: string;
  action_type?: string;
  ip_address: string;
  created_at: string;
}

export interface CreateSessionData {
  user_id: string;
  ip_address: string;
  user_agent: string;
  expires_in?: number; // en secondes, défaut 8 heures
}

export interface SessionStats {
  total_sessions: number;
  active_sessions: number;
  unique_users: number;
  average_duration: number;
  top_devices: Array<{ device: string; count: number }>;
  top_locations: Array<{ location: string; count: number }>;
}

export class SessionsService extends BaseService {
  /**
   * Créer une nouvelle session
   */
  static async createSession(data: CreateSessionData): Promise<ServiceResponse<UserSession | null>> {
    try {
      const sessionToken = this.generateSessionToken();
      const refreshToken = this.generateRefreshToken();
      const expiresIn = data.expires_in || 8 * 60 * 60; // 8 heures par défaut
      const expiresAt = new Date(Date.now() + expiresIn * 1000);
      
      const deviceInfo = this.parseUserAgent(data.user_agent);
      const location = await this.getLocationFromIP(data.ip_address);

      const supabaseClient = this.getSupabaseClient() as any;
      const { data: session, error } = await supabaseClient
        .from('user_sessions')
        .insert({
          user_id: data.user_id,
          session_token: sessionToken,
          refresh_token: refreshToken,
          ip_address: data.ip_address,
          user_agent: data.user_agent,
          device_info: deviceInfo,
          location,
          is_active: true,
          last_activity: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return this.createResponse(session as UserSession);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Valider une session
   */
  static async validateSession(sessionToken: string): Promise<ServiceResponse<UserSession | null>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('user_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) throw error;

      // Mettre à jour la dernière activité
      if (data) {
        await this.updateLastActivity(data.id);
      }

      return this.createResponse(data as UserSession);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Rafraîchir une session avec le refresh token
   */
  static async refreshSession(refreshToken: string): Promise<ServiceResponse<{
    session_token: string;
    expires_at: string;
  } | null>> {
    try {
      // Vérifier le refresh token
      const { data: session, error } = await this.getSupabaseClient()
        .from('user_sessions')
        .select('*')
        .eq('refresh_token', refreshToken)
        .eq('is_active', true)
        .single();

      if (error || !session) {
        return this.createResponse(null, 'Refresh token invalide');
      }

      // Générer un nouveau session token
      const newSessionToken = this.generateSessionToken();
      const newExpiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 heures

      const supabaseClient = this.getSupabaseClient() as any;
      await supabaseClient
        .from('user_sessions')
        .update({
          session_token: newSessionToken,
          expires_at: newExpiresAt.toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq('id', session.id);

      return this.createResponse({
        session_token: newSessionToken,
        expires_at: newExpiresAt.toISOString()
      });
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Terminer une session
   */
  static async endSession(sessionToken: string): Promise<ServiceResponse<boolean>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { error } = await supabaseClient
        .from('user_sessions')
        .update({
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('session_token', sessionToken);

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Terminer toutes les sessions d'un utilisateur
   */
  static async endAllUserSessions(userId: string, exceptSessionId?: string): Promise<ServiceResponse<number>> {
    try {
      let query = this.getSupabaseClient()
        .from('user_sessions')
        .update({
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (exceptSessionId) {
        query = query.neq('id', exceptSessionId);
      }

      const { data, error } = await query.select('id');

      if (error) throw error;

      return this.createResponse(data?.length || 0);
    } catch (error) {
      return this.createResponse(0, this.handleError(error));
    }
  }

  /**
   * Récupérer les sessions actives d'un utilisateur
   */
  static async getUserActiveSessions(userId: string): Promise<ServiceResponse<UserSession[]>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('last_activity', { ascending: false });

      if (error) throw error;

      return this.createResponse((data as UserSession[]) || []);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Enregistrer une activité de session
   */
  static async logActivity(
    sessionId: string,
    activityType: SessionActivity['activity_type'],
    pageUrl?: string,
    actionType?: string,
    ipAddress?: string
  ): Promise<ServiceResponse<SessionActivity | null>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { data, error } = await supabaseClient
        .from('session_activities')
        .insert({
          session_id: sessionId,
          activity_type: activityType,
          page_url: pageUrl,
          action_type: actionType,
          ip_address: ipAddress
        })
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour la dernière activité de la session
      await this.updateLastActivity(sessionId);

      return this.createResponse(data as SessionActivity);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Nettoyer les sessions expirées
   */
  static async cleanupExpiredSessions(): Promise<ServiceResponse<number>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { data, error } = await supabaseClient
        .from('user_sessions')
        .update({
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('is_active', true)
        .lt('expires_at', new Date().toISOString())
        .select('id');

      if (error) throw error;

      return this.createResponse(data?.length || 0);
    } catch (error) {
      return this.createResponse(0, this.handleError(error));
    }
  }

  /**
   * Récupérer les statistiques des sessions
   */
  static async getSessionStats(
    dateFrom?: string,
    dateTo?: string
  ): Promise<ServiceResponse<SessionStats | null>> {
    try {
      const fromDate = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const toDate = dateTo || new Date().toISOString();

      // Récupérer les sessions dans la période
      const { data: sessions, error } = await this.getSupabaseClient()
        .from('user_sessions')
        .select('*')
        .gte('created_at', fromDate)
        .lte('created_at', toDate);

      if (error) throw error;

      const sessionsData = sessions as UserSession[] || [];
      
      // Calculer les statistiques
      const totalSessions = sessionsData.length;
      const activeSessions = sessionsData.filter(s => s.is_active).length;
      const uniqueUsers = new Set(sessionsData.map(s => s.user_id)).size;
      
      // Calculer la durée moyenne
      const durations = sessionsData
        .filter(s => !s.is_active)
        .map(s => {
          const created = new Date(s.created_at).getTime();
          const ended = new Date(s.last_activity).getTime();
          return ended - created;
        });
      
      const averageDuration = durations.length > 0 
        ? durations.reduce((a, b) => a + b, 0) / durations.length / 1000 / 60 // en minutes
        : 0;

      // Top devices
      const deviceCounts = sessionsData.reduce((acc, session) => {
        const device = session.device_info.device || 'Unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topDevices = Object.entries(deviceCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([device, count]) => ({ device, count }));

      // Top locations
      const locationCounts = sessionsData.reduce((acc, session) => {
        const location = session.location || 'Unknown';
        acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topLocations = Object.entries(locationCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([location, count]) => ({ location, count }));

      const stats: SessionStats = {
        total_sessions: totalSessions,
        active_sessions: activeSessions,
        unique_users: uniqueUsers,
        average_duration: Math.round(averageDuration),
        top_devices: topDevices,
        top_locations: topLocations
      };

      return this.createResponse(stats);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer l'historique des sessions d'un utilisateur
   */
  static async getUserSessionHistory(
    userId: string,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<UserSession>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      const { data, error, count } = await this.getSupabaseClient()
        .from('user_sessions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const paginationInfo = this.calculatePagination(page, limit, total);

      return this.createPaginatedResponse((data as UserSession[]) || [], paginationInfo);
    } catch (error) {
      return this.createPaginatedResponse([], {
        page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false
      }, this.handleError(error));
    }
  }

  /**
   * Vérifier si une session est suspecte
   */
  static async checkSuspiciousSession(sessionId: string): Promise<ServiceResponse<{
    is_suspicious: boolean;
    reasons: string[];
    risk_score: number;
  } | null>> {
    try {
      const { data: session } = await this.getSupabaseClient()
        .from('user_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!session) {
        return this.createResponse(null, 'Session non trouvée');
      }

      const reasons: string[] = [];
      let riskScore = 0;

      // Vérifier l'IP inhabituelle
      const { data: recentSessions } = await this.getSupabaseClient()
        .from('user_sessions')
        .select('ip_address')
        .eq('user_id', session.user_id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .neq('id', sessionId);

      const knownIPs = recentSessions?.map((s: any) => s.ip_address) || [];
      if (!knownIPs.includes(session.ip_address)) {
        reasons.push('Nouvelle adresse IP');
        riskScore += 30;
      }

      // Vérifier le device inhabituel
      const { data: recentDevices } = await this.getSupabaseClient()
        .from('user_sessions')
        .select('device_info')
        .eq('user_id', session.user_id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .neq('id', sessionId);

      const knownDevices = recentDevices?.map((s: any) => 
        `${s.device_info.browser}-${s.device_info.os}-${s.device_info.device}`
      ) || [];
      
      const currentDevice = `${session.device_info.browser}-${session.device_info.os}-${session.device_info.device}`;
      if (!knownDevices.includes(currentDevice)) {
        reasons.push('Nouvel appareil');
        riskScore += 20;
      }

      // Vérifier la localisation
      if (session.location && session.location !== 'Unknown') {
        const { data: recentLocations } = await this.getSupabaseClient()
          .from('user_sessions')
          .select('location')
          .eq('user_id', session.user_id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .neq('id', sessionId);

        const knownLocations = recentLocations?.map((s: any) => s.location) || [];
        if (!knownLocations.includes(session.location)) {
          reasons.push('Nouvelle localisation');
          riskScore += 25;
        }
      }

      const isSuspicious = riskScore >= 50;

      return this.createResponse({
        is_suspicious: isSuspicious,
        reasons,
        risk_score: riskScore
      });
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Méthodes utilitaires privées
   */
  private static generateSessionToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) +
           Date.now().toString(36);
  }

  private static generateRefreshToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  private static parseUserAgent(userAgent: string): UserSession['device_info'] {
    // Parsing basique du user agent
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    let device = 'Desktop';
    if (userAgent.includes('iPhone')) device = 'iPhone';
    else if (userAgent.includes('iPad')) device = 'iPad';
    else if (userAgent.includes('Android')) device = 'Android';
    else if (isMobile) device = 'Mobile';

    return { browser, os, device, is_mobile: isMobile };
  }

  private static async updateLastActivity(sessionId: string): Promise<void> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      await supabaseClient
        .from('user_sessions')
        .update({
          last_activity: new Date().toISOString()
        })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'activité:', error);
    }
  }

  private static async getLocationFromIP(ipAddress: string): Promise<string | undefined> {
    // TODO: Implémenter la géolocalisation par IP (GeoIP, etc.)
    return 'Unknown';
  }
}