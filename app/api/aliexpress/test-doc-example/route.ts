import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * Test avec l'exemple EXACT de la documentation
 * Pour valider que notre logique de signature est correcte
 */
export async function GET() {
  const appSecret = process.env.ALIEXPRESS_APP_SECRET || '';
  
  // Exemple de la documentation
  const docExample = {
    apiPath: '/auth/token/create',
    params: {
      app_key: '12345678',
      code: '3_500102_JxZ05Ux3cnnSSUm6dCxYg6Q26',
      sign_method: 'sha256',
      timestamp: '1517820392000'
    },
    expectedSignString: '/auth/token/createapp_key12345678code3_500102_JxZ05Ux3cnnSSUm6dCxYg6Q26sign_methodsha256timestamp1517820392000'
  };
  
  // Notre génération
  const sortedKeys = Object.keys(docExample.params).sort();
  let ourSignString = docExample.apiPath;
  for (const key of sortedKeys) {
    ourSignString += key + (docExample.params as any)[key];
  }
  
  const match = ourSignString === docExample.expectedSignString;
  
  // Test avec notre appSecret réel
  const realParams = {
    app_key: process.env.ALIEXPRESS_APP_KEY || '',
    code: 'TEST_CODE_123',
    sign_method: 'sha256',
    timestamp: Date.now().toString()
  };
  
  const realSortedKeys = Object.keys(realParams).sort();
  let realSignString = docExample.apiPath;
  for (const key of realSortedKeys) {
    realSignString += key + (realParams as any)[key];
  }
  
  const realSignature = crypto.createHmac('sha256', appSecret)
    .update(realSignString, 'utf8')
    .digest('hex')
    .toUpperCase();
  
  return NextResponse.json({
    message: 'Validation avec l\'exemple de la documentation',
    docExample: {
      expectedSignString: docExample.expectedSignString,
      ourSignString: ourSignString,
      match: match,
      explanation: match 
        ? '✅ Notre logique de génération est CORRECTE' 
        : '❌ Notre logique de génération est INCORRECTE'
    },
    ourImplementation: {
      signString: realSignString,
      signature: realSignature,
      params: realParams,
      sortedKeys: realSortedKeys
    },
    breakdown: {
      step1: 'Trier les clés par ordre ASCII',
      step2: 'Construire: apiPath + key1 + value1 + key2 + value2 + ...',
      step3: 'HMAC-SHA256 avec appSecret comme clé',
      step4: 'Convertir en UPPERCASE hex'
    },
    potentialIssues: [
      {
        issue: 'Encodage du code OAuth',
        description: 'Le code OAuth peut contenir des caractères spéciaux qui doivent être encodés',
        solution: 'Vérifier si le code doit être URL-encodé ou non avant la signature'
      },
      {
        issue: 'Timestamp format',
        description: 'Le timestamp doit être en millisecondes (13 chiffres)',
        solution: 'Utiliser Date.now().toString() et non Date.now() / 1000'
      },
      {
        issue: 'App Secret',
        description: 'Vérifier que l\'appSecret est bien celui configuré dans le portail AliExpress',
        solution: 'Comparer avec .env.local'
      }
    ]
  });
}
