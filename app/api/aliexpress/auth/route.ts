import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressOAuthService } from '@/lib/services/aliexpress-oauth.service';

/**
 * Route pour initier l'autorisation OAuth AliExpress
 * Redirige l'utilisateur vers AliExpress pour autoriser l'application
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[OAuth Auth] Génération URL autorisation');

    const oauthService = getAliExpressOAuthService();
    
    // Générer un state unique pour sécurité
    const state = Math.random().toString(36).substring(7);
    
    // Générer l'URL d'autorisation
    const authUrl = oauthService.generateAuthorizationUrl(state);
    
    console.log('[OAuth Auth] Redirect vers:', authUrl.slice(0, 50) + '...');

    // Rediriger vers AliExpress
    return NextResponse.redirect(authUrl);

  } catch (error) {
    console.error('[OAuth Auth] Erreur:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'initialisation de l\'autorisation',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
