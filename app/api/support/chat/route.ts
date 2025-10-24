import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/lib/support/chat-service';

export async function POST(request: NextRequest) {
  try {
    const { action, conversationId, message, userInfo } = await request.json();

    const mistralApiKey = process.env.MISTRAL_API_KEY;
    if (!mistralApiKey) {
      return NextResponse.json(
        { success: false, error: 'Configuration API manquante' },
        { status: 500 }
      );
    }

    const chatService = new ChatService(mistralApiKey);

    switch (action) {
      case 'create_conversation':
        const createResult = await chatService.createConversation(userInfo);
        return NextResponse.json(createResult);

      case 'send_message':
        if (!conversationId || !message) {
          return NextResponse.json(
            { success: false, error: 'Conversation ID et message requis' },
            { status: 400 }
          );
        }
        const sendResult = await chatService.sendMessage(conversationId, message);
        return NextResponse.json(sendResult);

      case 'get_conversation':
        if (!conversationId) {
          return NextResponse.json(
            { success: false, error: 'Conversation ID requis' },
            { status: 400 }
          );
        }
        const getResult = await chatService.getConversation(conversationId);
        return NextResponse.json(getResult);

      default:
        return NextResponse.json(
          { success: false, error: 'Action non reconnue' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Erreur API Chat:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}