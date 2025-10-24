import { NextRequest, NextResponse } from 'next/server';
import { MistralClient } from '@/lib/support/mistral-client';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message requis' },
        { status: 400 }
      );
    }

    const mistralApiKey = process.env.MISTRAL_API_KEY;
    if (!mistralApiKey) {
      console.error('MISTRAL_API_KEY non configurée');
      return NextResponse.json(
        { success: false, error: 'Configuration API manquante' },
        { status: 500 }
      );
    }

    const mistralClient = new MistralClient(mistralApiKey);
    const response = await mistralClient.generateResponse(
      message,
      conversationHistory || [],
      context
    );

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Erreur API Mistral:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la génération de la réponse',
        data: {
          content: 'Désolé, je rencontre un problème technique. Un agent humain va vous aider.',
          shouldEscalate: true,
          confidence: 0
        }
      },
      { status: 500 }
    );
  }
}