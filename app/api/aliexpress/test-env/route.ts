import { NextResponse } from 'next/server';

// Force Node.js runtime
export const runtime = 'nodejs';

/**
 * Route de test pour vérifier les variables d'environnement
 */
export async function GET() {
  const appKey = process.env.ALIEXPRESS_APP_KEY;
  const appSecret = process.env.ALIEXPRESS_APP_SECRET;
  const redirectUri = process.env.ALIEXPRESS_REDIRECT_URI;

  return NextResponse.json({
    status: 'test',
    variables: {
      ALIEXPRESS_APP_KEY: appKey ? `✅ Défini (${appKey.slice(0, 3)}***)` : '❌ MANQUANT',
      ALIEXPRESS_APP_SECRET: appSecret ? `✅ Défini (${appSecret.slice(0, 3)}***)` : '❌ MANQUANT',
      ALIEXPRESS_REDIRECT_URI: redirectUri ? `✅ Défini (${redirectUri.slice(0, 30)}...)` : '❌ MANQUANT',
    },
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL ? '✅ Déployé sur Vercel' : '❌ Local',
  });
}
