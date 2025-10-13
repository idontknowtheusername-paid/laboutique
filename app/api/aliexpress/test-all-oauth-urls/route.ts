import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Test de toutes les URLs OAuth possibles
 */
export async function GET() {
  const appKey = process.env.ALIEXPRESS_APP_KEY;
  const redirectUri = process.env.ALIEXPRESS_REDIRECT_URI;
  const state = 'test123';

  const baseParams = `client_id=${appKey}&app_key=${appKey}&redirect_uri=${encodeURIComponent(redirectUri || '')}&state=${state}&response_type=code`;

  const urlsToTest = [
    {
      name: 'Alibaba OAuth (actuel)',
      url: `https://oauth.alibaba.com/authorize?${baseParams}`,
      description: 'Endpoint standard Alibaba OAuth'
    },
    {
      name: 'AliExpress OAuth',
      url: `https://oauth.aliexpress.com/authorize?${baseParams}`,
      description: 'Endpoint AliExpress spécifique'
    },
    {
      name: 'API AliExpress OAuth',
      url: `https://api.aliexpress.com/oauth/authorize?${baseParams}`,
      description: 'API AliExpress endpoint'
    },
    {
      name: 'Gateway Alibaba',
      url: `https://gw.api.alibaba.com/oauth/authorize?${baseParams}`,
      description: 'Gateway Alibaba OAuth'
    },
    {
      name: 'OpenAPI Alibaba',
      url: `https://openapi.alibaba.com/oauth/authorize?${baseParams}`,
      description: 'OpenAPI Alibaba'
    },
    {
      name: 'Auth Alibaba',
      url: `https://auth.alibaba.com/oauth/authorize?${baseParams}`,
      description: 'Auth Alibaba endpoint'
    }
  ];

  return NextResponse.json({
    message: 'Testez ces URLs une par une dans votre navigateur',
    appKey: appKey,
    redirectUri: redirectUri,
    instructions: 'Ouvrez chaque URL ci-dessous. Celle qui NE donne PAS d\'erreur est la bonne !',
    urlsToTest: urlsToTest.map((item, index) => ({
      number: index + 1,
      name: item.name,
      description: item.description,
      url: item.url,
      testLink: `Copiez cette URL dans votre navigateur pour tester`
    }))
  });
}
