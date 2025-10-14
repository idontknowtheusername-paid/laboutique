import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * Test amélioré de signature avec plusieurs variantes
 * Compare différentes méthodes pour trouver la bonne
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testCode = searchParams.get('code') || 'TEST_CODE_123';
  const testNow = searchParams.get('use_real_time') === 'true';
  
  const appKey = process.env.ALIEXPRESS_APP_KEY || '';
  const appSecret = process.env.ALIEXPRESS_APP_SECRET || '';
  const timestamp = testNow ? Date.now().toString() : '1517820392000';
  const apiPath = '/auth/token/create';
  
  const results: any[] = [];
  
  // ===========================================
  // VARIANTE 1: HMAC-SHA256 avec sign_method
  // ===========================================
  {
    const params: Record<string, string> = {
      app_key: appKey,
      code: testCode,
      timestamp: timestamp,
      sign_method: 'sha256',
    };
    
    const sortedKeys = Object.keys(params).sort();
    let signString = apiPath;
    for (const key of sortedKeys) {
      signString += key + params[key];
    }
    
    const signature = crypto.createHmac('sha256', appSecret)
      .update(signString, 'utf8')
      .digest('hex')
      .toUpperCase();
    
    results.push({
      name: 'HMAC-SHA256 avec sign_method',
      signString,
      signature,
      params: { ...params, sign: signature }
    });
  }
  
  // ===========================================
  // VARIANTE 2: HMAC-SHA256 SANS sign_method
  // ===========================================
  {
    const params: Record<string, string> = {
      app_key: appKey,
      code: testCode,
      timestamp: timestamp,
    };
    
    const sortedKeys = Object.keys(params).sort();
    let signString = apiPath;
    for (const key of sortedKeys) {
      signString += key + params[key];
    }
    
    const signature = crypto.createHmac('sha256', appSecret)
      .update(signString, 'utf8')
      .digest('hex')
      .toUpperCase();
    
    results.push({
      name: 'HMAC-SHA256 SANS sign_method',
      signString,
      signature,
      params: { ...params, sign: signature, sign_method: 'sha256' }
    });
  }
  
  // ===========================================
  // VARIANTE 3: MD5 wrappé (Business API style)
  // ===========================================
  {
    const params: Record<string, string> = {
      app_key: appKey,
      code: testCode,
      timestamp: timestamp,
      sign_method: 'md5',
      format: 'json',
      v: '2.0',
      method: 'auth.token.create',
    };
    
    const sortedKeys = Object.keys(params).sort();
    let signString = appSecret;
    for (const key of sortedKeys) {
      signString += key + params[key];
    }
    signString += appSecret;
    
    const signature = crypto.createHash('md5')
      .update(signString, 'utf8')
      .digest('hex')
      .toUpperCase();
    
    results.push({
      name: 'MD5 wrappé (Business API)',
      signString,
      signature,
      params: { ...params, sign: signature }
    });
  }
  
  // ===========================================
  // VARIANTE 4: SHA256 simple (non HMAC)
  // ===========================================
  {
    const params: Record<string, string> = {
      app_key: appKey,
      code: testCode,
      timestamp: timestamp,
      sign_method: 'sha256',
    };
    
    const sortedKeys = Object.keys(params).sort();
    let signString = apiPath;
    for (const key of sortedKeys) {
      signString += key + params[key];
    }
    
    const signature = crypto.createHash('sha256')
      .update(signString, 'utf8')
      .digest('hex')
      .toUpperCase();
    
    results.push({
      name: 'SHA256 simple (non HMAC)',
      signString,
      signature,
      params: { ...params, sign: signature }
    });
  }
  
  // ===========================================
  // VARIANTE 5: HMAC-SHA256 avec secret wrappé
  // ===========================================
  {
    const params: Record<string, string> = {
      app_key: appKey,
      code: testCode,
      timestamp: timestamp,
      sign_method: 'sha256',
    };
    
    const sortedKeys = Object.keys(params).sort();
    let signString = appSecret + apiPath;
    for (const key of sortedKeys) {
      signString += key + params[key];
    }
    signString += appSecret;
    
    const signature = crypto.createHmac('sha256', appSecret)
      .update(signString, 'utf8')
      .digest('hex')
      .toUpperCase();
    
    results.push({
      name: 'HMAC-SHA256 avec secret wrappé',
      signString,
      signature,
      params: { ...params, sign: signature }
    });
  }
  
  return NextResponse.json({
    message: 'Test de 5 variantes de signature',
    documentation_reference: {
      example_signString: '/auth/token/createapp_key12345678code3_500102_JxZ05Ux3cnnSSUm6dCxYg6Q26sign_methodsha256timestamp1517820392000',
      note: 'Comparez votre signString avec cet exemple'
    },
    test_info: {
      timestamp: timestamp,
      using_real_time: testNow,
      code: testCode,
      app_key: appKey,
      app_secret_preview: appSecret.slice(0, 10) + '...'
    },
    results: results,
    recommendation: 'Utilisez /api/aliexpress/manual-test-token?code=XXX pour tester avec un vrai code OAuth',
    next_step: 'Vérifiez les logs Vercel pour voir les headers X-Ca-Error-Message'
  });
}
