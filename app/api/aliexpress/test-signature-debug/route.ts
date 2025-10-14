import { NextResponse } from 'next/server';
import { getAliExpressOAuthService } from '@/lib/services/aliexpress-oauth.service';

export const runtime = 'nodejs';

/**
 * Test de signature avec logging détaillé
 * Utilise un code fictif pour déclencher l'erreur et capturer X-Ca-Error-Message
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code') || 'TEST_CODE_12345';
    
    console.log('[Test Debug] Début du test avec code:', code);
    
    const oauthService = getAliExpressOAuthService();
    
    try {
      // Cette méthode va échouer mais nous donnera les logs détaillés
      const token = await oauthService.exchangeCodeForToken(code);
      
      return NextResponse.json({
        success: true,
        message: 'Token échangé avec succès (inattendu)',
        token: {
          access_token: token.access_token.substring(0, 20) + '...',
          expires_in: token.expires_in,
        }
      });
    } catch (error) {
      console.log('[Test Debug] Erreur attendue:', error);
      
      return NextResponse.json({
        success: false,
        message: 'Erreur attendue - voir les logs pour X-Ca-Error-Message',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        code_used: code,
        instructions: [
          '1. Vérifiez les logs Vercel pour voir X-Ca-Error-Message',
          '2. Comparez avec notre signString dans les logs',
          '3. Utilisez un vrai code OAuth si nécessaire'
        ]
      });
    }
    
  } catch (error) {
    console.error('[Test Debug] Exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erreur',
    }, { status: 500 });
  }
}