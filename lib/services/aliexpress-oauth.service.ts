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
  // API endpoint pour System Interfaces (auth/token)
  // Documentation: System Interfaces use /rest not /sync
  private restBaseUrl = 'https://api-sg.aliexpress.com/rest';

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
   * Documentation: https://openservice.aliexpress.com/doc/api.htm?cid=3&path=/auth/token/create
   */
  async exchangeCodeForToken(code: string): Promise<AliExpressOAuthToken> {
    console.log('[OAuth] Échange code contre access_token');

    // Utiliser l'API /auth/token/create selon la documentation
    const timestamp = Date.now().toString();
    
    const params: Record<string, any> = {
      app_key: this.config.appKey,
      code: code,
      timestamp: timestamp,
      sign_method: 'md5',
      format: 'json',
      v: '2.0',
      method: 'auth.token.create',
    };

    // Générer la signature
    params.sign = this.generateSign(params);

    try {
      const url = `${this.restBaseUrl}/auth/token/create?${new URLSearchParams(params).toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[OAuth] Erreur HTTP:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[OAuth] Réponse token:', data);

      // Vérifier les erreurs
      if (data.error_response) {
        console.error('[OAuth] Erreur API:', data.error_response);
        throw new Error(data.error_response.msg || 'Erreur lors de l\'échange du code');
      }

      // Le token est dans la réponse directe
      if (!data.access_token) {
        console.error('[OAuth] Pas de access_token dans la réponse:', data);
        throw new Error('Pas de access_token dans la réponse');
      }

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in || 2592000, // 30 jours selon la doc
        refresh_expires_in: data.refresh_expires_in || 5184000, // 60 jours
        token_type: data.token_type || 'Bearer',
        user_id: data.user_id || data.seller_id,
        aliexpress_user_id: data.havana_id,
      };
    } catch (error) {
      console.error('[OAuth] Échec échange code:', error);
      throw error;
    }
  }

  /**
   * Générer la signature SHA256 pour System Interfaces (auth/token)
   * Documentation: For System APIs, include API path in signature string
   */
  private generateSystemSign(apiPath: string, params: Record<string, any>): string {
    // Trier les paramètres par clé (ASCII order)
    const sortedKeys = Object.keys(params).sort();
    
    // Construire la chaîne : /api/pathkey1value1key2value2...
    let signString = apiPath;
    for (const key of sortedKeys) {
      if (params[key] !== undefined && params[key] !== null && key !== 'sign') {
        signString += key + params[key];
      }
    }

    // Hasher avec SHA256 (pas MD5 pour System Interfaces)
    return crypto.createHash('sha256').update(signString, 'utf8').digest('hex').toUpperCase();
  }

  /**
   * Générer la signature HMAC-MD5 pour Business Interfaces (produits, etc.)
   */
  private generateSign(params: Record<string, any>): string {
    // Trier les paramètres par clé
    const sortedKeys = Object.keys(params).sort();
    
    // Construire la chaîne à signer
    let signString = this.config.appSecret;
    for (const key of sortedKeys) {
      if (params[key] !== undefined && params[key] !== null) {
        signString += key + params[key];
      }
    }
    signString += this.config.appSecret;

    // Générer signature MD5
    return crypto.createHash('md5').update(signString, 'utf8').digest('hex').toUpperCase();
  }

  /**
   * Rafraîchir un access_token expiré
   * Documentation: System Interface - uses /rest endpoint with SHA256
   */
  async refreshAccessToken(refreshToken: string): Promise<AliExpressOAuthToken> {
    console.log('[OAuth] Rafraîchissement access_token');

    const timestamp = Date.now().toString();
    const apiPath = '/auth/token/refresh';
    
    const params: Record<string, any> = {
      app_key: this.config.appKey,
      refresh_token: refreshToken,
      timestamp: timestamp,
      sign_method: 'sha256',
    };

    // Générer la signature pour System Interface
    params.sign = this.generateSystemSign(apiPath, params);

    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.restBaseUrl}${apiPath}?${queryString}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
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

      if (!data.access_token) {
        console.error('[OAuth] Pas de access_token dans la réponse:', data);
        throw new Error('Pas de access_token dans la réponse');
      }

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in || 2592000,
        refresh_expires_in: data.refresh_expires_in || 5184000,
        token_type: data.token_type || 'Bearer',
        user_id: data.user_id || data.seller_id,
        aliexpress_user_id: data.havana_id,
      };
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
