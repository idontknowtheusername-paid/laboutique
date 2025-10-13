import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-server';
import type {
  AliExpressOAuthConfig,
  AliExpressOAuthToken,
  StoredOAuthToken,
  OAuthAuthorizationParams,
  OAuthTokenParams,
  OAuthRefreshParams
} from '@/lib/types/aliexpress-oauth';

/**
 * Service OAuth pour AliExpress Dropship APIs
 */
export class AliExpressOAuthService {
  private config: AliExpressOAuthConfig;
  // URL OAuth pour AliExpress (documentation officielle)
  // https://openservice.aliexpress.com/doc/doc.htm?nodeId=27493&docId=118729
  private authBaseUrl = 'https://api-sg.aliexpress.com/oauth/authorize';
  private tokenUrl = 'https://gw.api.alibaba.com/openapi/param2/1/system.oauth2/getToken';

  constructor(config?: AliExpressOAuthConfig) {
    this.config = config || {
      appKey: process.env.ALIEXPRESS_APP_KEY || '',
      appSecret: process.env.ALIEXPRESS_APP_SECRET || '',
      redirectUri: process.env.ALIEXPRESS_REDIRECT_URI || '',
    };

    if (!this.config.appKey || !this.config.appSecret) {
      throw new Error('ALIEXPRESS_APP_KEY et ALIEXPRESS_APP_SECRET sont requis');
    }

    if (!this.config.redirectUri) {
      throw new Error('ALIEXPRESS_REDIRECT_URI est requis');
    }
  }

  /**
   * Générer l'URL d'autorisation pour rediriger l'utilisateur
   * Documentation: https://openservice.aliexpress.com/doc/doc.htm?nodeId=27493&docId=118729
   */
  generateAuthorizationUrl(state?: string): string {
    // Paramètres selon la documentation officielle
    const params = {
      response_type: 'code',
      client_id: this.config.appKey,  // Documentation dit: client_id=${appkey}
      redirect_uri: this.config.redirectUri,
      force_auth: 'true',  // Recommandé par la documentation
      state: state || crypto.randomBytes(16).toString('hex'),
    };

    const queryString = new URLSearchParams(params as any).toString();
    return `${this.authBaseUrl}?${queryString}`;
  }

  /**
   * Échanger le code d'autorisation contre un access_token
   */
  async exchangeCodeForToken(code: string): Promise<AliExpressOAuthToken> {
    console.log('[OAuth] Échange code contre access_token');

    const params: OAuthTokenParams = {
      app_key: this.config.appKey,
      app_secret: this.config.appSecret,
      code,
      grant_type: 'authorization_code',
    };

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params as any).toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[OAuth] Erreur HTTP:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[OAuth] Token reçu');

      if (data.error_response) {
        console.error('[OAuth] Erreur API:', data.error_response);
        throw new Error(data.error_response.msg || 'Erreur OAuth');
      }

      return data as AliExpressOAuthToken;
    } catch (error) {
      console.error('[OAuth] Échec échange code:', error);
      throw error;
    }
  }

  /**
   * Rafraîchir un access_token expiré
   */
  async refreshAccessToken(refreshToken: string): Promise<AliExpressOAuthToken> {
    console.log('[OAuth] Rafraîchissement access_token');

    const params: OAuthRefreshParams = {
      app_key: this.config.appKey,
      app_secret: this.config.appSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params as any).toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[OAuth] Erreur refresh:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[OAuth] Token rafraîchi');

      if (data.error_response) {
        console.error('[OAuth] Erreur API:', data.error_response);
        throw new Error(data.error_response.msg || 'Erreur refresh token');
      }

      return data as AliExpressOAuthToken;
    } catch (error) {
      console.error('[OAuth] Échec refresh:', error);
      throw error;
    }
  }

  /**
   * Stocker un token en base de données
   */
  async storeToken(token: AliExpressOAuthToken, userId?: string): Promise<StoredOAuthToken> {
    console.log('[OAuth] Stockage token en base');

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + token.expires_in);

    const tokenData = {
      user_id: userId || null,
      access_token: token.access_token,
      refresh_token: token.refresh_token || null,
      expires_at: expiresAt.toISOString(),
      token_type: token.token_type || 'Bearer',
      updated_at: new Date().toISOString(),
    };

    try {
      // Vérifier si un token existe déjà
      const { data: existingTokens } = await (supabaseAdmin as any)
        .from('aliexpress_oauth_tokens')
        .select('id')
        .limit(1);

      if (existingTokens && existingTokens.length > 0) {
        // Update existing token
        const { data, error } = await (supabaseAdmin as any)
          .from('aliexpress_oauth_tokens')
          .update(tokenData)
          .eq('id', existingTokens[0].id)
          .select()
          .single();

        if (error) {
          console.error('[OAuth] Erreur update token:', error);
          throw error;
        }

        console.log('[OAuth] Token mis à jour');
        return data as StoredOAuthToken;
      } else {
        // Insert new token
        const { data, error } = await (supabaseAdmin as any)
          .from('aliexpress_oauth_tokens')
          .insert([tokenData])
          .select()
          .single();

        if (error) {
          console.error('[OAuth] Erreur insert token:', error);
          throw error;
        }

        console.log('[OAuth] Token créé');
        return data as StoredOAuthToken;
      }
    } catch (error) {
      console.error('[OAuth] Échec stockage token:', error);
      throw error;
    }
  }

  /**
   * Récupérer le token valide (refresh si nécessaire)
   */
  async getValidToken(): Promise<string> {
    console.log('[OAuth] Récupération token valide');

    try {
      // Récupérer le dernier token
      const { data: tokens, error } = await (supabaseAdmin as any)
        .from('aliexpress_oauth_tokens')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('[OAuth] Erreur récupération token:', error);
        throw new Error('Erreur récupération token');
      }

      if (!tokens || tokens.length === 0) {
        throw new Error('Aucun token trouvé. Veuillez autoriser l\'application.');
      }

      const storedToken = tokens[0] as StoredOAuthToken;
      const now = new Date();
      const expiresAt = new Date(storedToken.expires_at);

      // Token encore valide
      if (expiresAt > now) {
        console.log('[OAuth] Token valide');
        return storedToken.access_token;
      }

      // Token expiré, refresh
      console.log('[OAuth] Token expiré, rafraîchissement...');

      if (!storedToken.refresh_token) {
        throw new Error('Pas de refresh token. Veuillez ré-autoriser l\'application.');
      }

      const newToken = await this.refreshAccessToken(storedToken.refresh_token);
      await this.storeToken(newToken, storedToken.user_id);

      return newToken.access_token;
    } catch (error) {
      console.error('[OAuth] Échec récupération token valide:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un token valide existe
   */
  async hasValidToken(): Promise<boolean> {
    try {
      await this.getValidToken();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Supprimer tous les tokens
   */
  async revokeAllTokens(): Promise<void> {
    console.log('[OAuth] Révocation de tous les tokens');

    try {
      const { error } = await (supabaseAdmin as any)
        .from('aliexpress_oauth_tokens')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) {
        console.error('[OAuth] Erreur révocation tokens:', error);
        throw error;
      }

      console.log('[OAuth] Tous les tokens révoqués');
    } catch (error) {
      console.error('[OAuth] Échec révocation:', error);
      throw error;
    }
  }
}

// Export singleton
let oauthServiceInstance: AliExpressOAuthService | null = null;

export function getAliExpressOAuthService(): AliExpressOAuthService {
  if (!oauthServiceInstance) {
    oauthServiceInstance = new AliExpressOAuthService();
  }
  return oauthServiceInstance;
}
