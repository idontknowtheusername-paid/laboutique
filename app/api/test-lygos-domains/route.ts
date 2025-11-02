import { NextRequest, NextResponse } from 'next/server';

/**
 * Test pour trouver le bon domaine de paiement Lygos
 */
export async function GET(request: NextRequest) {
  try {
    // Utiliser un gateway_id existant de nos tests précédents
    const gatewayId = "5f23387a-bad0-40d4-a0fc-b5ab1040c31c";
    
    // Tous les domaines possibles à tester
    const domainsToTest = [
      'https://pay.lygosapp.com',
      'https://checkout.lygos.app', 
      'https://payment.lygosapp.com',
      'https://lygosapp.com/pay',
      'https://checkout.lygosapp.com',
      'https://widget.lygosapp.com',
      'https://app.lygosapp.com/pay',
      'https://secure.lygosapp.com',
      'https://gateway.lygosapp.com'
    ];

    const results = [];

    for (const domain of domainsToTest) {
      const testUrl = `${domain}/${gatewayId}`;
      
      try {
        console.log(`[Test Domains] 🧪 Test: ${testUrl}`);
        
        // Test avec HEAD request pour éviter de charger tout le contenu
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(testUrl, {
          method: 'HEAD',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        results.push({
          domain: domain,
          url: testUrl,
          status: response.status,
          statusText: response.statusText,
          accessible: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });

        console.log(`[Test Domains] ✅ ${domain}: ${response.status}`);
        
      } catch (error: any) {
        results.push({
          domain: domain,
          url: testUrl,
          status: 'ERROR',
          statusText: error.message,
          accessible: false,
          error: error.message
        });

        console.log(`[Test Domains] ❌ ${domain}: ${error.message}`);
      }
    }

    // Analyser les résultats
    const workingDomains = results.filter(r => r.accessible);
    const notFoundDomains = results.filter(r => r.status === 404);
    const errorDomains = results.filter(r => r.status === 'ERROR');

    return NextResponse.json({
      success: true,
      gateway_id: gatewayId,
      test_results: results,
      analysis: {
        total_tested: domainsToTest.length,
        working_domains: workingDomains.length,
        not_found_domains: notFoundDomains.length,
        error_domains: errorDomains.length,
        recommended_domain: workingDomains[0]?.domain || 'Aucun domaine fonctionnel trouvé'
      },
      working_domains: workingDomains,
      all_results: results
    });

  } catch (error: any) {
    console.error('[Test Domains] ❌ Erreur:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}