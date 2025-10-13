import { NextResponse } from 'next/server';
import { getAliExpressOAuthService } from '@/lib/services/aliexpress-oauth.service';

export const runtime = 'nodejs';

/**
 * Vérifier si un token OAuth existe et est valide
 */
export async function GET() {
  try {
    const oauthService = getAliExpressOAuthService();
    
    // Vérifier si un token existe
    const hasToken = await oauthService.hasValidToken();
    
    if (!hasToken) {
      return NextResponse.json({
        status: 'no_token',
        message: 'Aucun token trouvé. Vous devez autoriser l\'application.',
        action: 'Allez sur /api/aliexpress/auth pour autoriser',
      });
    }
    
    // Essayer de récupérer un token valide
    try {
      const token = await oauthService.getValidToken();
      
      return NextResponse.json({
        status: 'token_valid',
        message: 'Token OAuth trouvé et valide !',
        token: {
          preview: token.substring(0, 20) + '...',
          length: token.length,
        },
      });
    } catch (error) {
      return NextResponse.json({
        status: 'token_error',
        message: 'Token trouvé mais erreur lors de la récupération',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }, { status: 500 });
    }
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 });
  }
}
