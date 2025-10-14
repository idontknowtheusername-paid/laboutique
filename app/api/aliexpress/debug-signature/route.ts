import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * Debug endpoint pour analyser la génération de signature
 * Teste différentes méthodes de génération de signature
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({
        error: 'Paramètre code requis',
        usage: '/api/aliexpress/debug-signature?code=VOTRE_CODE',
      });
    }

    const appKey = process.env.ALIEXPRESS_APP_KEY || '';
    const appSecret = process.env.ALIEXPRESS_APP_SECRET || '';
    const timestamp = Date.now().toString();
    
    // Paramètres de base
    const baseParams = {
      app_key: appKey,
      code: code,
      timestamp: timestamp,
      sign_method: 'md5',
      format: 'json',
      v: '2.0',
      method: 'auth.token.create',
    };

    // Test 1: Signature MD5 classique (actuelle)
    const sign1 = generateMD5Signature(baseParams, appSecret);
    
    // Test 2: Signature avec SHA256
    const sign2 = generateSHA256Signature(baseParams, appSecret);
    
    // Test 3: Signature System Interface avec chemin API
    const sign3 = generateSystemSignature('/auth/token/create', baseParams, appSecret);
    
    // Test 4: Signature avec paramètres triés différemment
    const sign4 = generateSortedSignature(baseParams, appSecret);
    
    // Test 5: Signature avec HMAC-SHA256
    const sign5 = generateHMACSignature(baseParams, appSecret);
    
    // Test 6: Signature sans app_secret au début/fin
    const sign6 = generateNoSecretSignature(baseParams, appSecret);

    const results = {
      code: code.substring(0, 10) + '...',
      timestamp,
      signatures: {
        md5_classic: sign1,
        sha256: sign2,
        system_interface: sign3,
        sorted_params: sign4,
        hmac_sha256: sign5,
        no_secret_wrap: sign6,
      },
      test_urls: {
        md5_classic: buildTestUrl(baseParams, sign1),
        sha256: buildTestUrl({...baseParams, sign_method: 'sha256'}, sign2),
        system_interface: buildTestUrl(baseParams, sign3),
        sorted_params: buildTestUrl(baseParams, sign4),
        hmac_sha256: buildTestUrl({...baseParams, sign_method: 'sha256'}, sign5),
        no_secret_wrap: buildTestUrl(baseParams, sign6),
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Signatures générées pour comparaison',
      results
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

function generateSortedSignature(params: Record<string, any>, appSecret: string): string {
  // Trier par valeur aussi, pas seulement par clé
  const sortedEntries = Object.entries(params)
    .filter(([k, v]) => v !== undefined && v !== null)
    .sort(([a], [b]) => a.localeCompare(b));
  
  let signString = appSecret;
  for (const [key, value] of sortedEntries) {
    signString += key + value;
  }
  signString += appSecret;
  return crypto.createHash('md5').update(signString, 'utf8').digest('hex').toUpperCase();
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

function buildTestUrl(params: Record<string, any>, signature: string): string {
  const testParams = { ...params, sign: signature };
  const queryString = new URLSearchParams(testParams).toString();
  return `https://api-sg.aliexpress.com/rest/auth/token/create?${queryString}`;
}