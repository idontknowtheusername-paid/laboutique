import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * Test en direct avec l'API AliExpress - teste plusieurs variantes
 * Usage: /api/aliexpress/test-live-variations?code=VOTRE_CODE
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.json({
      error: 'Paramètre code requis',
      usage: '/api/aliexpress/test-live-variations?code=VOTRE_CODE',
      instructions: 'Autorisez d\'abord sur /api/aliexpress/auth, puis récupérez le code dans l\'URL de callback'
    });
  }
  
  const appKey = process.env.ALIEXPRESS_APP_KEY || '';
  const appSecret = process.env.ALIEXPRESS_APP_SECRET || '';
  const timestamp = Date.now().toString();
  const apiPath = '/auth/token/create';
  const baseUrl = 'https://api-sg.aliexpress.com/rest';
  
  const results: any[] = [];
  
  // ===========================================
  // VARIANTE 1: HMAC-SHA256 avec sign_method inclus
  // ===========================================
  console.log('\n========== TEST VARIANTE 1 ==========');
  try {
    const params: Record<string, string> = {
      app_key: appKey,
      code: code,
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
    
    params['sign'] = signature;
    
    console.log('[V1] SignString:', signString);
    console.log('[V1] Signature:', signature);
    
    const url = `${baseUrl}${apiPath}?${new URLSearchParams(params).toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    });
    
    const responseData = await response.text();
    const headers: Record<string, string> = {};
    response.headers.forEach((v, k) => headers[k] = v);
    
    results.push({
      name: 'HMAC-SHA256 avec sign_method',
      success: response.ok,
      status: response.status,
      signString,
      signature,
      errorMessage: headers['x-ca-error-message'] || null,
      response: responseData.substring(0, 500),
      headers
    });
  } catch (error) {
    results.push({
      name: 'HMAC-SHA256 avec sign_method',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // ===========================================
  // VARIANTE 2: HMAC-SHA256 SANS sign_method dans signString
  // ===========================================
  console.log('\n========== TEST VARIANTE 2 ==========');
  try {
    const params: Record<string, string> = {
      app_key: appKey,
      code: code,
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
    
    const finalParams = { ...params, sign: signature, sign_method: 'sha256' };
    
    console.log('[V2] SignString:', signString);
    console.log('[V2] Signature:', signature);
    
    const url = `${baseUrl}${apiPath}?${new URLSearchParams(finalParams).toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    });
    
    const responseData = await response.text();
    const headers: Record<string, string> = {};
    response.headers.forEach((v, k) => headers[k] = v);
    
    results.push({
      name: 'HMAC-SHA256 SANS sign_method dans signString',
      success: response.ok,
      status: response.status,
      signString,
      signature,
      errorMessage: headers['x-ca-error-message'] || null,
      response: responseData.substring(0, 500),
      headers
    });
  } catch (error) {
    results.push({
      name: 'HMAC-SHA256 SANS sign_method',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // ===========================================
  // VARIANTE 3: Lowercase signature
  // ===========================================
  console.log('\n========== TEST VARIANTE 3 ==========');
  try {
    const params: Record<string, string> = {
      app_key: appKey,
      code: code,
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
      .toLowerCase(); // LOWERCASE
    
    params['sign'] = signature;
    
    console.log('[V3] SignString:', signString);
    console.log('[V3] Signature:', signature);
    
    const url = `${baseUrl}${apiPath}?${new URLSearchParams(params).toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    });
    
    const responseData = await response.text();
    const headers: Record<string, string> = {};
    response.headers.forEach((v, k) => headers[k] = v);
    
    results.push({
      name: 'HMAC-SHA256 lowercase',
      success: response.ok,
      status: response.status,
      signString,
      signature,
      errorMessage: headers['x-ca-error-message'] || null,
      response: responseData.substring(0, 500),
      headers
    });
  } catch (error) {
    results.push({
      name: 'HMAC-SHA256 lowercase',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Attendre un peu entre les requêtes
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json({
    message: 'Test de 3 variantes en direct avec l\'API AliExpress',
    test_info: {
      code: code.substring(0, 20) + '...',
      timestamp,
      app_key: appKey,
    },
    results: results,
    analysis: {
      successful: results.filter(r => r.success).map(r => r.name),
      failed: results.filter(r => !r.success).map(r => r.name),
      errorMessages: results.map(r => ({
        name: r.name,
        errorMessage: r.errorMessage,
        status: r.status
      }))
    }
  });
}
