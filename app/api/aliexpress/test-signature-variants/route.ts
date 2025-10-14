import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * Test différentes variantes de signature pour AliExpress
 * Basé sur la documentation officielle et les bonnes pratiques
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code') || 'TEST_CODE_12345';
    
    const appKey = process.env.ALIEXPRESS_APP_KEY || '';
    const appSecret = process.env.ALIEXPRESS_APP_SECRET || '';
    const timestamp = Date.now().toString();
    
    const baseParams = {
      app_key: appKey,
      code: code,
      timestamp: timestamp,
      sign_method: 'md5',
      format: 'json',
      v: '2.0',
      method: 'auth.token.create',
    };

    // Test différentes variantes de signature
    const variants = [
      {
        name: 'MD5 Classique (actuel)',
        params: { ...baseParams },
        signature: generateMD5Classic(baseParams, appSecret)
      },
      {
        name: 'MD5 avec access_token',
        params: { ...baseParams, access_token: 'test' },
        signature: generateMD5Classic({...baseParams, access_token: 'test'}, appSecret)
      },
      {
        name: 'SHA256 au lieu de MD5',
        params: { ...baseParams, sign_method: 'sha256' },
        signature: generateSHA256Classic(baseParams, appSecret)
      },
      {
        name: 'System Interface avec chemin API',
        params: { ...baseParams },
        signature: generateSystemInterface('/auth/token/create', baseParams, appSecret)
      },
      {
        name: 'HMAC-SHA256',
        params: { ...baseParams, sign_method: 'sha256' },
        signature: generateHMAC(baseParams, appSecret)
      },
      {
        name: 'Sans app_secret au début/fin',
        params: { ...baseParams },
        signature: generateNoSecretWrap(baseParams, appSecret)
      },
      {
        name: 'Avec grant_type',
        params: { ...baseParams, grant_type: 'authorization_code' },
        signature: generateMD5Classic({...baseParams, grant_type: 'authorization_code'}, appSecret)
      },
      {
        name: 'Avec client_id au lieu de app_key',
        params: { ...baseParams, client_id: appKey, app_key: undefined },
        signature: generateMD5Classic({...baseParams, client_id: appKey}, appSecret)
      }
    ];

    const results = [];

    for (const variant of variants) {
      try {
        // Nettoyer les paramètres undefined
        const cleanParams = Object.fromEntries(
          Object.entries(variant.params).filter(([_, value]) => value !== undefined)
        );
        
        const testParams = { ...cleanParams, sign: variant.signature };
        const queryString = new URLSearchParams(testParams).toString();
        const url = `https://api-sg.aliexpress.com/rest/auth/token/create?${queryString}`;
        
        console.log(`[Test ${variant.name}] URL:`, url);
        console.log(`[Test ${variant.name}] Signature:`, variant.signature);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        });

        const responseText = await response.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { raw_response: responseText };
        }

        // Capturer les headers importants
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });

        const xCaErrorMessage = headers['x-ca-error-message'] || headers['X-Ca-Error-Message'];

        results.push({
          variant: variant.name,
          signature: variant.signature,
          status: response.status,
          success: response.ok,
          x_ca_error_message: xCaErrorMessage,
          response: responseData,
          url: url
        });

        console.log(`[Test ${variant.name}] Status:`, response.status);
        console.log(`[Test ${variant.name}] X-Ca-Error-Message:`, xCaErrorMessage);

      } catch (error) {
        results.push({
          variant: variant.name,
          signature: variant.signature,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          success: false
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tests de variantes de signature terminés',
      code: code.substring(0, 10) + '...',
      results,
      summary: {
        total_variants: variants.length,
        successful_variants: results.filter(r => r.success).length,
        failed_variants: results.filter(r => !r.success).length,
        error_messages: results
          .filter(r => r.x_ca_error_message)
          .map(r => ({ variant: r.variant, message: r.x_ca_error_message }))
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erreur',
    }, { status: 500 });
  }
}

function generateMD5Classic(params: Record<string, any>, appSecret: string): string {
  const sortedKeys = Object.keys(params).sort();
  let signString = appSecret;
  for (const key of sortedKeys) {
    if (params[key] !== undefined && params[key] !== null) {
      signString += key + params[key];
    }
  }
  signString += appSecret;
  return crypto.createHash('md5').update(signString, 'utf8').digest('hex').toUpperCase();
}

function generateSHA256Classic(params: Record<string, any>, appSecret: string): string {
  const sortedKeys = Object.keys(params).sort();
  let signString = appSecret;
  for (const key of sortedKeys) {
    if (params[key] !== undefined && params[key] !== null) {
      signString += key + params[key];
    }
  }
  signString += appSecret;
  return crypto.createHash('sha256').update(signString, 'utf8').digest('hex').toUpperCase();
}

function generateSystemInterface(apiPath: string, params: Record<string, any>, appSecret: string): string {
  const sortedKeys = Object.keys(params).filter(k => k !== 'sign').sort();
  let signString = apiPath;
  for (const key of sortedKeys) {
    signString += key + params[key];
  }
  return crypto.createHmac('sha256', appSecret).update(signString, 'utf8').digest('hex').toUpperCase();
}

function generateHMAC(params: Record<string, any>, appSecret: string): string {
  const sortedKeys = Object.keys(params).sort();
  let signString = '';
  for (const key of sortedKeys) {
    if (params[key] !== undefined && params[key] !== null) {
      signString += key + params[key];
    }
  }
  return crypto.createHmac('sha256', appSecret).update(signString, 'utf8').digest('hex').toUpperCase();
}

function generateNoSecretWrap(params: Record<string, any>, appSecret: string): string {
  const sortedKeys = Object.keys(params).sort();
  let signString = '';
  for (const key of sortedKeys) {
    if (params[key] !== undefined && params[key] !== null) {
      signString += key + params[key];
    }
  }
  return crypto.createHash('md5').update(signString, 'utf8').digest('hex').toUpperCase();
}