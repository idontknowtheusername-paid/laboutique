import { NextRequest, NextResponse } from 'next/server';

/**
 * Debug endpoint pour vérifier la configuration Lygos
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[Debug Lygos] 🔍 Vérification configuration...');

    // Vérifier les variables d'environnement
    const apiKey = process.env.LYGOS_API_KEY;
    const apiUrl = process.env.LYGOS_API_URL;
    const mode = process.env.LYGOS_MODE;

    console.log('[Debug Lygos] 📋 Variables env:', {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiUrl: apiUrl || 'non définie',
      mode: mode || 'non défini'
    });

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'LYGOS_API_KEY manquante',
        config: {
          hasApiKey: false,
          apiUrl: apiUrl || 'https://api.lygosapp.com/v1',
          mode: mode || 'production'
        }
      }, { status: 400 });
    }

    // Test simple de l'API Lygos
    const baseUrl = apiUrl || 'https://api.lygosapp.com/v1';
    
    console.log('[Debug Lygos] 🌐 Test API:', baseUrl);

    const response = await fetch(`${baseUrl}/gateway`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
    });

    const responseText = await response.text();
    
    console.log('[Debug Lygos] 📥 Réponse API:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText.substring(0, 200)
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      config: {
        hasApiKey: true,
        apiKeyLength: apiKey.length,
        apiKeyPreview: `${apiKey.substring(0, 8)}...`,
        apiUrl: baseUrl,
        mode: mode || 'production'
      },
      response: {
        body: responseText,
        headers: Object.fromEntries(response.headers.entries())
      }
    });

  } catch (error: any) {
    console.error('[Debug Lygos] 💥 Erreur:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      config: {
        hasApiKey: !!process.env.LYGOS_API_KEY,
        apiUrl: process.env.LYGOS_API_URL || 'https://api.lygosapp.com/v1',
        mode: process.env.LYGOS_MODE || 'production'
      }
    }, { status: 500 });
  }
}