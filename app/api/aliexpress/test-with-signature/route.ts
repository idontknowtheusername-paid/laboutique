import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Tester l'API avec une signature spécifique
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const signature = searchParams.get('signature');
  const code = searchParams.get('code');
  
  if (!signature || !code) {
    return NextResponse.json({
      error: 'Paramètres requis: signature et code',
      usage: '/api/aliexpress/test-with-signature?signature=XXX&code=YYY',
      help: 'Allez sur /api/aliexpress/test-all-signatures pour obtenir les signatures à tester'
    });
  }
  
  const appKey = process.env.ALIEXPRESS_APP_KEY || '';
  const timestamp = Date.now().toString();
  const apiPath = '/auth/token/create';
  
  const params = new URLSearchParams({
    app_key: appKey,
    code: code,
    timestamp: timestamp,
    sign_method: 'sha256',
    sign: signature
  });
  
  const url = `https://api-sg.aliexpress.com/rest${apiPath}?${params.toString()}`;
  
  try {
    console.log('[Test Signature] URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });
    
    const data = await response.json();
    
    console.log('[Test Signature] Réponse:', JSON.stringify(data, null, 2));
    
    if (data.access_token) {
      return NextResponse.json({
        success: true,
        message: '✅ CETTE SIGNATURE FONCTIONNE !',
        signature_used: signature,
        token_preview: data.access_token.substring(0, 20) + '...',
        full_response: data
      });
    } else if (data.error_code || data.error_message) {
      return NextResponse.json({
        success: false,
        message: '❌ Signature invalide',
        signature_used: signature,
        error: {
          code: data.error_code || data.code,
          message: data.error_message || data.message,
          type: data.error_type || data.type
        },
        full_response: data
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '⚠️ Réponse inattendue',
        signature_used: signature,
        full_response: data
      });
    }
    
  } catch (error) {
    console.error('[Test Signature] Erreur:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      signature_used: signature
    }, { status: 500 });
  }
}
