import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * Test de génération de signature pour debug
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testCode = searchParams.get('code') || 'TEST_CODE_123';
  
  const appKey = process.env.ALIEXPRESS_APP_KEY || '';
  const appSecret = process.env.ALIEXPRESS_APP_SECRET || '';
  const timestamp = Date.now().toString();
  const apiPath = '/auth/token/create';
  
  // Paramètres
  const params: Record<string, string> = {
    app_key: appKey,
    code: testCode,
    timestamp: timestamp,
    sign_method: 'sha256',
  };
  
  // Trier les paramètres
  const sortedKeys = Object.keys(params).sort();
  
  // Construire la chaîne à signer
  let signString = apiPath;
  for (const key of sortedKeys) {
    signString += key + params[key];
  }
  
  // Générer la signature avec HMAC-SHA256 (CORRECTION)
  const signature = crypto.createHmac('sha256', appSecret).update(signString, 'utf8').digest('hex').toUpperCase();
  
  // URL finale
  params['sign'] = signature;
  const finalUrl = `https://api-sg.aliexpress.com/rest${apiPath}?${new URLSearchParams(params).toString()}`;
  
  return NextResponse.json({
    debug: 'Signature Generation Test',
    method: 'HMAC-SHA256 (CORRIGÉ)',
    step1_parameters: params,
    step2_sorted_keys: sortedKeys,
    step3_sign_string: signString,
    step4_signature: signature,
    step5_final_url: finalUrl,
    documentation_example: {
      signString: '/auth/token/createapp_key12345678code3_500102_JxZ05Ux3cnnSSUm6dCxYg6Q26sign_methodsha256timestamp1517820392000',
      note: 'Compare notre signString avec cet exemple de la doc'
    },
    fix_applied: {
      before: 'crypto.createHash(sha256) - SHA256 simple',
      after: 'crypto.createHmac(sha256, appSecret) - HMAC-SHA256',
      reason: 'Le SDK Java utilise appSecret, donc la signature doit utiliser HMAC avec appSecret comme clé'
    },
    config: {
      appKey: appKey,
      appSecret: appSecret ? `${appSecret.slice(0, 5)}...` : 'MANQUANT',
    }
  });
}
