import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * Test toutes les variantes de signature et capture les headers de réponse
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({
        error: 'Paramètre code requis',
        usage: '/api/aliexpress/test-all-signatures?code=VOTRE_CODE',
      });
    }

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

    const tests = [
      {
        name: 'MD5 Classique',
        params: { ...baseParams },
        signature: generateMD5Signature(baseParams, appSecret)
      },
      {
        name: 'SHA256',
        params: { ...baseParams, sign_method: 'sha256' },
        signature: generateSHA256Signature(baseParams, appSecret)
      },
      {
        name: 'System Interface',
        params: { ...baseParams },
        signature: generateSystemSignature('/auth/token/create', baseParams, appSecret)
      },
      {
        name: 'HMAC-SHA256',
        params: { ...baseParams, sign_method: 'sha256' },
        signature: generateHMACSignature(baseParams, appSecret)
      },
      {
        name: 'Sans app_secret wrap',
        params: { ...baseParams },
        signature: generateNoSecretSignature(baseParams, appSecret)
      },
      {
        name: 'Avec access_token dans params',
        params: { ...baseParams, access_token: 'test' },
        signature: generateMD5Signature({...baseParams, access_token: 'test'}, appSecret)
      }
    ];

    const results = [];

    for (const test of tests) {
      try {
        const testParams = { ...test.params, sign: test.signature };
        const queryString = new URLSearchParams(testParams).toString();
        const url = `https://api-sg.aliexpress.com/rest/auth/token/create?${queryString}`;
        
        console.log(`[Test ${test.name}] URL:`, url);
        console.log(`[Test ${test.name}] Signature:`, test.signature);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        });

        // Capturer tous les headers
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });

        const responseText = await response.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { raw_response: responseText };
        }

        results.push({
          test_name: test.name,
          signature: test.signature,
          status: response.status,
          headers,
          response: responseData,
          x_ca_error_message: headers['x-ca-error-message'] || headers['X-Ca-Error-Message'],
          success: response.ok
        });

        console.log(`[Test ${test.name}] Status:`, response.status);
        console.log(`[Test ${test.name}] X-Ca-Error-Message:`, headers['x-ca-error-message'] || headers['X-Ca-Error-Message']);

      } catch (error) {
        results.push({
          test_name: test.name,
          signature: test.signature,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          success: false
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tests de signature terminés',
      code: code.substring(0, 10) + '...',
      results,
      summary: {
        total_tests: tests.length,
        successful_tests: results.filter(r => r.success).length,
        failed_tests: results.filter(r => !r.success).length,
        error_messages: results
          .filter(r => r.x_ca_error_message)
          .map(r => ({ test: r.test_name, message: r.x_ca_error_message }))
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erreur',
    }, { status: 500 });
  }
}

function generateMD5Signature(params: Record<string, any>, appSecret: string): string {
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

function generateSHA256Signature(params: Record<string, any>, appSecret: string): string {
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

function generateSystemSignature(apiPath: string, params: Record<string, any>, appSecret: string): string {
  const sortedKeys = Object.keys(params).filter(k => k !== 'sign').sort();
  let signString = apiPath;
  for (const key of sortedKeys) {
    signString += key + params[key];
  }
  return crypto.createHmac('sha256', appSecret).update(signString, 'utf8').digest('hex').toUpperCase();
}

function generateHMACSignature(params: Record<string, any>, appSecret: string): string {
  const sortedKeys = Object.keys(params).sort();
  let signString = '';
  for (const key of sortedKeys) {
    if (params[key] !== undefined && params[key] !== null) {
      signString += key + params[key];
    }
  }
  return crypto.createHmac('sha256', appSecret).update(signString, 'utf8').digest('hex').toUpperCase();
}

function generateNoSecretSignature(params: Record<string, any>, appSecret: string): string {
  const sortedKeys = Object.keys(params).sort();
  let signString = '';
  for (const key of sortedKeys) {
    if (params[key] !== undefined && params[key] !== null) {
      signString += key + params[key];
    }
  }
  return crypto.createHash('md5').update(signString, 'utf8').digest('hex').toUpperCase();
}