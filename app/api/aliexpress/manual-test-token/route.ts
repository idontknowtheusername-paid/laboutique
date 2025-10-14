import { NextResponse } from 'next/server';
import { getAliExpressOAuthService } from '@/lib/services/aliexpress-oauth.service';

export const runtime = 'nodejs';

/**
 * Test manuel avec un vrai code OAuth
 * URL: /api/aliexpress/manual-test-token?code=VOTRE_CODE
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({
        error: 'Paramètre code requis',
        usage: '/api/aliexpress/manual-test-token?code=VOTRE_CODE',
        instructions: 'Autorisez d\'abord sur /api/aliexpress/auth, puis récupérez le code dans l\'URL de callback et testez ici'
      });
    }
    
    const oauthService = getAliExpressOAuthService();
    
    try {
      const token = await oauthService.exchangeCodeForToken(code);
      
      return NextResponse.json({
        success: true,
        message: 'Token échangé avec succès !',
        token: {
          access_token: token.access_token.substring(0, 20) + '...',
          expires_in: token.expires_in,
          has_refresh_token: !!token.refresh_token,
        }
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        details: 'Voir les logs pour plus de détails'
      }, { status: 500 });
    }
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erreur',
    }, { status: 500 });
  }
}
