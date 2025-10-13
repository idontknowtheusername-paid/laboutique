import { NextResponse } from 'next/server';
import { getAliExpressOAuthService } from '@/lib/services/aliexpress-oauth.service';

// Force Node.js runtime
export const runtime = 'nodejs';

/**
 * Route de debug pour voir l'URL OAuth générée
 */
export async function GET() {
  try {
    const oauthService = getAliExpressOAuthService();
    const state = 'test123';
    const authUrl = oauthService.generateAuthorizationUrl(state);

    // Parser l'URL pour voir tous les paramètres
    const url = new URL(authUrl);
    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return NextResponse.json({
      status: 'debug',
      fullUrl: authUrl,
      baseUrl: url.origin + url.pathname,
      parameters: params,
      config: {
        appKey: process.env.ALIEXPRESS_APP_KEY || '❌ MANQUANT',
        appSecret: process.env.ALIEXPRESS_APP_SECRET ? '✅ Défini' : '❌ MANQUANT',
        redirectUri: process.env.ALIEXPRESS_REDIRECT_URI || '❌ MANQUANT',
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
