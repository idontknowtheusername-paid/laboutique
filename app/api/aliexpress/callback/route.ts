import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime pour accéder aux variables d'environnement
export const runtime = 'nodejs';

/**
 * Callback OAuth AliExpress Dropship
 * Cette route reçoit le code d'autorisation après que l'utilisateur autorise l'app
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('[OAuth Callback] Reçu:', { 
      hasCode: !!code, 
      hasError: !!error, 
      state 
    });

    // Gérer les erreurs d'autorisation
    if (error) {
      console.error('[OAuth Callback] Erreur autorisation:', error);
      return NextResponse.redirect(
        new URL(`/admin/products?oauth_error=${encodeURIComponent(error)}`, request.url)
      );
    }

    // Vérifier que le code est présent
    if (!code) {
      console.error('[OAuth Callback] Code manquant');
      return NextResponse.redirect(
        new URL('/admin/products?oauth_error=missing_code', request.url)
      );
    }

    // Échanger le code contre un access_token
    console.log('[OAuth Callback] Échange code contre token...');
    // Import dynamique pour éviter les erreurs de build
    const { getAliExpressOAuthService } = await import('@/lib/services/aliexpress-oauth.service');
    const oauthService = getAliExpressOAuthService();
    
    const token = await oauthService.exchangeCodeForToken(code);
    console.log('[OAuth Callback] Token reçu');

    // Stocker le token en base
    console.log('[OAuth Callback] Stockage token...');
    await oauthService.storeToken(token);
    console.log('[OAuth Callback] Token stocké');

    // Rediriger vers l'admin avec succès
    return NextResponse.redirect(
      new URL('/admin/products?oauth_success=true', request.url)
    );

  } catch (error) {
    console.error('[OAuth Callback] Erreur:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erreur lors de l\'autorisation';

    return NextResponse.redirect(
      new URL(`/admin/products?oauth_error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
