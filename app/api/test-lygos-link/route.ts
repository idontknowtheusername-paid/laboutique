import { NextRequest, NextResponse } from 'next/server';

/**
 * Test pour voir exactement ce que contient le champ "link" de Lygos
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.LYGOS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'LYGOS_API_KEY manquante' }, { status: 400 });
    }

    console.log('[Test Lygos Link] 🧪 Test du champ link...');

    // 1. D'abord, lister les gateways existantes pour récupérer un ID
    const listResponse = await fetch('https://api.lygosapp.com/v1/gateway', {
      method: 'GET',
      headers: {
        'api-key': apiKey,
      },
    });

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      return NextResponse.json({ 
        error: 'Erreur liste gateways', 
        status: listResponse.status,
        response: errorText 
      }, { status: 500 });
    }

    const gateways = await listResponse.json();
    console.log('[Test Lygos Link] 📋 Gateways trouvées:', gateways.length);

    if (!gateways || gateways.length === 0) {
      return NextResponse.json({ 
        error: 'Aucune gateway trouvée',
        suggestion: 'Créez d\'abord une gateway via le checkout'
      }, { status: 404 });
    }

    // 2. Prendre la première gateway et récupérer ses détails
    const firstGateway = gateways[0];
    const gatewayId = firstGateway.id;

    console.log('[Test Lygos Link] 🔍 Test avec gateway_id:', gatewayId);

    const detailResponse = await fetch(`https://api.lygosapp.com/v1/gateway/${gatewayId}`, {
      method: 'GET',
      headers: {
        'api-key': apiKey,
      },
    });

    if (!detailResponse.ok) {
      const errorText = await detailResponse.text();
      return NextResponse.json({ 
        error: 'Erreur détails gateway', 
        status: detailResponse.status,
        response: errorText 
      }, { status: 500 });
    }

    const gatewayDetails = await detailResponse.json();

    console.log('[Test Lygos Link] 🔗 VALEUR EXACTE du champ link:', gatewayDetails.link);

    return NextResponse.json({
      success: true,
      gateway_id: gatewayId,
      link_value: gatewayDetails.link,
      link_analysis: {
        is_complete_url: gatewayDetails.link?.startsWith('http'),
        contains_our_domain: gatewayDetails.link?.includes('jomionstore.com'),
        contains_lygos_domain: gatewayDetails.link?.includes('lygosapp.com'),
        raw_value: gatewayDetails.link
      },
      full_gateway_details: gatewayDetails
    });

  } catch (error: any) {
    console.error('[Test Lygos Link] ❌ Erreur:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}