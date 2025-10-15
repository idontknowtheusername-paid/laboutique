import { NextRequest, NextResponse } from 'nextjs';
import { getAliExpressOAuthService } from '@/lib/services/aliexpress-oauth.service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('[Test] Démarrage test OAuth réel');
    
    const oauthService = getAliExpressOAuthService();
    
    // Utiliser un code fictif pour tester la nouvelle méthode POST
    const testCode = 'TEST_CODE_' + Date.now();
    
    console.log('[Test] Code de test:', testCode);
    console.log('[Test] Test avec méthode POST sur /sync');
    
    const result = await oauthService.exchangeCodeForToken(testCode);
    
    return NextResponse.json({
      success: true,
      message: 'Test OAuth réussi !',
      result: result
    });
    
  } catch (error: any) {
    console.error('[Test] Erreur test OAuth:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Test OAuth échoué',
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}