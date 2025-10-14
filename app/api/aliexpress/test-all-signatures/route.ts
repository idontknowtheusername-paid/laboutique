import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * Test de TOUTES les variantes de signature possibles
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testCode = searchParams.get('code') || 'TEST_CODE_123';
  
  const appKey = process.env.ALIEXPRESS_APP_KEY || '';
  const appSecret = process.env.ALIEXPRESS_APP_SECRET || '';
  const timestamp = Date.now().toString();
  const apiPath = '/auth/token/create';
  
  // Paramètres de base
  const params: Record<string, string> = {
    app_key: appKey,
    code: testCode,
    timestamp: timestamp,
    sign_method: 'sha256',
  };
  
  const sortedKeys = Object.keys(params).sort();
  
  // ========================================
  // VARIANTE 1: HMAC-SHA256 avec path au début (actuelle)
  // ========================================
  let signString1 = apiPath;
  for (const key of sortedKeys) {
    signString1 += key + params[key];
  }
  const signature1 = crypto.createHmac('sha256', appSecret).update(signString1, 'utf8').digest('hex').toUpperCase();
  
  // ========================================
  // VARIANTE 2: SHA256 simple avec path + wrapping appSecret (comme MD5)
  // ========================================
  let signString2 = appSecret + apiPath;
  for (const key of sortedKeys) {
    signString2 += key + params[key];
  }
  signString2 += appSecret;
  const signature2 = crypto.createHash('sha256').update(signString2, 'utf8').digest('hex').toUpperCase();
  
  // ========================================
  // VARIANTE 3: HMAC-SHA256 SANS path
  // ========================================
  let signString3 = '';
  for (const key of sortedKeys) {
    signString3 += key + params[key];
  }
  const signature3 = crypto.createHmac('sha256', appSecret).update(signString3, 'utf8').digest('hex').toUpperCase();
  
  // ========================================
  // VARIANTE 4: SHA256 simple avec path SEULEMENT (pas de wrapping)
  // ========================================
  let signString4 = apiPath;
  for (const key of sortedKeys) {
    signString4 += key + params[key];
  }
  const signature4 = crypto.createHash('sha256').update(signString4, 'utf8').digest('hex').toUpperCase();
  
  // ========================================
  // VARIANTE 5: MD5 avec wrapping appSecret (comme Business API)
  // ========================================
  let signString5 = appSecret;
  for (const key of sortedKeys) {
    signString5 += key + params[key];
  }
  signString5 += appSecret;
  const signature5 = crypto.createHash('md5').update(signString5, 'utf8').digest('hex').toUpperCase();
  
  // ========================================
  // VARIANTE 6: HMAC-SHA256 avec wrapping appSecret au début/fin
  // ========================================
  let signString6 = appSecret + apiPath;
  for (const key of sortedKeys) {
    signString6 += key + params[key];
  }
  signString6 += appSecret;
  const signature6 = crypto.createHmac('sha256', appSecret).update(signString6, 'utf8').digest('hex').toUpperCase();
  
  return NextResponse.json({
    test: 'All Signature Variants',
    parameters: params,
    sorted_keys: sortedKeys,
    variants: {
      variant_1: {
        name: 'HMAC-SHA256 avec path (ACTUELLE)',
        sign_string: signString1,
        signature: signature1,
        description: 'crypto.createHmac(sha256, appSecret) avec apiPath au début'
      },
      variant_2: {
        name: 'SHA256 avec path + wrapping appSecret',
        sign_string: signString2,
        signature: signature2,
        description: 'crypto.createHash(sha256) avec appSecret au début et fin + apiPath'
      },
      variant_3: {
        name: 'HMAC-SHA256 SANS path',
        sign_string: signString3,
        signature: signature3,
        description: 'crypto.createHmac(sha256, appSecret) sans apiPath'
      },
      variant_4: {
        name: 'SHA256 simple avec path SEULEMENT',
        sign_string: signString4,
        signature: signature4,
        description: 'crypto.createHash(sha256) avec apiPath, pas de wrapping'
      },
      variant_5: {
        name: 'MD5 avec wrapping (comme Business API)',
        sign_string: signString5,
        signature: signature5,
        description: 'crypto.createHash(md5) avec appSecret au début et fin, SANS apiPath',
        note: 'Même si sign_method=sha256, peut-être que System API utilise MD5 ?'
      },
      variant_6: {
        name: 'HMAC-SHA256 avec wrapping complet',
        sign_string: signString6,
        signature: signature6,
        description: 'crypto.createHmac(sha256, appSecret) avec appSecret ET apiPath wrapping'
      }
    },
    next_step: {
      message: 'Testez chaque signature manuellement',
      how: 'Copiez chaque signature et testez-la via /api/aliexpress/test-with-signature?signature=XXX&code=YYY'
    },
    config: {
      appKey: appKey,
      appSecret: appSecret ? `${appSecret.slice(0, 5)}...` : 'MANQUANT',
      apiPath: apiPath
    }
  });
}
