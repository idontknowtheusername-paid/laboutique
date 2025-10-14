import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * Capture le header X-Ca-Error-Message avec notre signature actuelle
 * C'est l'endpoint le plus important pour comprendre ce que le serveur attend
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({
        error: 'Paramètre code requis',
        usage: '/api/aliexpress/capture-error-message?code=VOTRE_CODE',
        instructions: [
          '1. Allez sur /api/aliexpress/auth pour obtenir un code',
          '2. Copiez le code de l\'URL de callback',
          '3. Testez avec ce endpoint pour voir X-Ca-Error-Message'
        ]
      });
    }

    const appKey = process.env.ALIEXPRESS_APP_KEY || '';
    const appSecret = process.env.ALIEXPRESS_APP_SECRET || '';
    const timestamp = Date.now().toString();
    
    // Utiliser exactement la même logique que dans le service OAuth
    const params: Record<string, any> = {
      app_key: appKey,
      code: code,
      timestamp: timestamp,
      sign_method: 'md5',
      format: 'json',
      v: '2.0',
      method: 'auth.token.create',
    };

    // Générer la signature exactement comme dans le service
    const signature = generateSign(params, appSecret);
    params.sign = signature;

    const url = `https://api-sg.aliexpress.com/rest/auth/token/create?${new URLSearchParams(params).toString()}`;
    
    console.log('[Capture Error] URL:', url);
    console.log('[Capture Error] Params:', params);
    console.log('[Capture Error] Signature:', signature);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    // Capturer TOUS les headers
    const allHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      allHeaders[key] = value;
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw_response: responseText };
    }

    // Headers spécifiques importants
    const xCaErrorMessage = allHeaders['x-ca-error-message'] || allHeaders['X-Ca-Error-Message'];
    const xCaRequestId = allHeaders['x-ca-request-id'] || allHeaders['X-Ca-Request-Id'];
    const xCaErrorCode = allHeaders['x-ca-error-code'] || allHeaders['X-Ca-Error-Code'];

    console.log('[Capture Error] Status:', response.status);
    console.log('[Capture Error] X-Ca-Error-Message:', xCaErrorMessage);
    console.log('[Capture Error] X-Ca-Request-Id:', xCaRequestId);
    console.log('[Capture Error] X-Ca-Error-Code:', xCaErrorCode);
    console.log('[Capture Error] All Headers:', allHeaders);

    return NextResponse.json({
      success: true,
      code: code.substring(0, 10) + '...',
      timestamp,
      signature,
      url,
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: allHeaders,
        data: responseData
      },
      critical_headers: {
        x_ca_error_message: xCaErrorMessage,
        x_ca_request_id: xCaRequestId,
        x_ca_error_code: xCaErrorCode
      },
      analysis: {
        has_error_message: !!xCaErrorMessage,
        error_message_length: xCaErrorMessage?.length || 0,
        is_success: response.ok,
        response_type: typeof responseData
      }
    });
    
  } catch (error) {
    console.error('[Capture Error] Exception:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erreur',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

/**
 * Générer la signature exactement comme dans le service OAuth
 */
function generateSign(params: Record<string, any>, appSecret: string): string {
  // Trier les paramètres par clé
  const sortedKeys = Object.keys(params).sort();
  
  // Construire la chaîne à signer
  let signString = appSecret;
  for (const key of sortedKeys) {
    if (params[key] !== undefined && params[key] !== null) {
      signString += key + params[key];
    }
  }
  signString += appSecret;

  console.log('[Capture Error] SignString:', signString);

  // Générer signature MD5
  return crypto.createHash('md5').update(signString, 'utf8').digest('hex').toUpperCase();
}