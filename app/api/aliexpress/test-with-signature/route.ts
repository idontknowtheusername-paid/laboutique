import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * Test avec une signature spécifique et capture du header X-Ca-Error-Message
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const signatureType = searchParams.get('type') || 'md5';
    
    if (!code) {
      return NextResponse.json({
        error: 'Paramètre code requis',
        usage: '/api/aliexpress/test-with-signature?code=VOTRE_CODE&type=md5|sha256|system|hmac',
        types: {
          md5: 'Signature MD5 classique',
          sha256: 'Signature SHA256',
          system: 'Signature System Interface',
          hmac: 'Signature HMAC-SHA256'
        }
      });
    }

    const appKey = process.env.ALIEXPRESS_APP_KEY || '';
    const appSecret = process.env.ALIEXPRESS_APP_SECRET || '';
    const timestamp = Date.now().toString();
    
    const baseParams = {
      app_key: appKey,
      code: code,
      timestamp: timestamp,
      sign_method: signatureType === 'sha256' || signatureType === 'hmac' ? 'sha256' : 'md5',
      format: 'json',
      v: '2.0',
      method: 'auth.token.create',
    };

    let signature: string;
    let signString: string;

    switch (signatureType) {
      case 'sha256':
        signature = generateSHA256Signature(baseParams, appSecret);
        signString = buildSignString(baseParams, appSecret, 'sha256');
        break;
      case 'system':
        signature = generateSystemSignature('/auth/token/create', baseParams, appSecret);
        signString = buildSystemSignString('/auth/token/create', baseParams);
        break;
      case 'hmac':
        signature = generateHMACSignature(baseParams, appSecret);
        signString = buildHMACSignString(baseParams);
        break;
      default: // md5
        signature = generateMD5Signature(baseParams, appSecret);
        signString = buildSignString(baseParams, appSecret, 'md5');
    }

    const testParams = { ...baseParams, sign: signature };
    const queryString = new URLSearchParams(testParams).toString();
    const url = `https://api-sg.aliexpress.com/rest/auth/token/create?${queryString}`;
    
    console.log(`[Test ${signatureType}] URL:`, url);
    console.log(`[Test ${signatureType}] SignString:`, signString);
    console.log(`[Test ${signatureType}] Signature:`, signature);
    
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

    const xCaErrorMessage = headers['x-ca-error-message'] || headers['X-Ca-Error-Message'];

    console.log(`[Test ${signatureType}] Status:`, response.status);
    console.log(`[Test ${signatureType}] X-Ca-Error-Message:`, xCaErrorMessage);
    console.log(`[Test ${signatureType}] Response:`, responseData);

    return NextResponse.json({
      success: true,
      test_type: signatureType,
      code: code.substring(0, 10) + '...',
      sign_string: signString,
      signature: signature,
      url: url,
      response: {
        status: response.status,
        headers,
        data: responseData
      },
      x_ca_error_message: xCaErrorMessage,
      is_success: response.ok
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

function buildSignString(params: Record<string, any>, appSecret: string, method: string): string {
  const sortedKeys = Object.keys(params).sort();
  let signString = appSecret;
  for (const key of sortedKeys) {
    if (params[key] !== undefined && params[key] !== null) {
      signString += key + params[key];
    }
  }
  signString += appSecret;
  return signString;
}

function buildSystemSignString(apiPath: string, params: Record<string, any>): string {
  const sortedKeys = Object.keys(params).filter(k => k !== 'sign').sort();
  let signString = apiPath;
  for (const key of sortedKeys) {
    signString += key + params[key];
  }
  return signString;
}

function buildHMACSignString(params: Record<string, any>): string {
  const sortedKeys = Object.keys(params).sort();
  let signString = '';
  for (const key of sortedKeys) {
    if (params[key] !== undefined && params[key] !== null) {
      signString += key + params[key];
    }
  }
  return signString;
}