import { NextRequest, NextResponse } from 'next/server';

/**
 * Callback OAuth AliExpress
 * Cette route reçoit le code d'autorisation après que l'utilisateur autorise l'app
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    console.log('[AliExpress Callback] Received:', { code: code?.slice(0, 10) + '...', state });

    if (!code) {
      return NextResponse.json(
        { error: 'Code d\'autorisation manquant' },
        { status: 400 }
      );
    }

    // TODO: Échanger le code contre un access token
    // Ce sera implémenté dans la prochaine étape

    return NextResponse.json({
      success: true,
      message: 'Autorisation reçue avec succès',
      code: code.slice(0, 10) + '...' // Log partiel pour sécurité
    });

  } catch (error) {
    console.error('[AliExpress Callback] Error:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du traitement du callback',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
