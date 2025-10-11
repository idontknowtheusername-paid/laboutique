/**
 * Types TypeScript pour OAuth AliExpress Dropship
 */

export interface AliExpressOAuthConfig {
  appKey: string;
  appSecret: string;
  redirectUri: string;
}

export interface AliExpressOAuthToken {
  access_token: string;
  refresh_token?: string;
  expires_in: number; // Secondes jusqu'à expiration
  refresh_expires_in?: number;
  token_type: string; // "Bearer"
  user_id?: string;
  aliexpress_user_id?: string;
}

export interface StoredOAuthToken {
  id: string;
  user_id?: string;
  access_token: string;
  refresh_token?: string;
  expires_at: Date;
  token_type: string;
  created_at: Date;
  updated_at: Date;
}

export interface OAuthAuthorizationParams {
  app_key: string;
  redirect_uri: string;
  state: string;
  response_type: 'code';
  scope?: string;
}

export interface OAuthTokenParams {
  app_key: string;
  app_secret: string;
  code: string;
  grant_type: 'authorization_code';
}

export interface OAuthRefreshParams {
  app_key: string;
  app_secret: string;
  refresh_token: string;
  grant_type: 'refresh_token';
}
