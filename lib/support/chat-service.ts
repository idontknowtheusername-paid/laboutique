import { SupportMessage, SupportConversation } from '@/types/support';
import { supabase } from '@/lib/supabase';
import { MistralClient } from './mistral-client';
import { TicketService } from './ticket-service';

export class ChatService {
  private mistralClient: MistralClient;
  private ticketService: TicketService;

  constructor(mistralApiKey: string) {
    this.mistralClient = new MistralClient(mistralApiKey);
    this.ticketService = new TicketService();
  }

  async createConversation(userInfo?: {
    userId?: string;
    userEmail?: string;
    userName?: string;
  }): Promise<{ success: boolean; conversationId?: string; error?: string }> {
    try {
      const conversationData = {
        user_id: userInfo?.userId || null,
        user_email: userInfo?.userEmail || null,
        user_name: userInfo?.userName || null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase as any)
        .from('support_conversations')
        .insert(conversationData)
        .select()
        .single();

      if (error) {
        console.error('Erreur création conversation:', error);
        return { success: false, error: error.message };
      }

      return { success: true, conversationId: data.id };
    } catch (error) {
      console.error('Erreur ChatService:', error);
      return { success: false, error: 'Erreur lors de la création de la conversation' };
    }
  }

  async sendMessage(
    conversationId: string,
    content: string,
    sender: 'user' | 'ai' | 'admin' = 'user'
  ): Promise<{ success: boolean; message?: SupportMessage; shouldEscalate?: boolean; error?: string }> {
    try {
      // Sauvegarder le message utilisateur
      const userMessage = await this.saveMessage(conversationId, content, 'user');
      
      if (!userMessage.success) {
        return { success: false, error: userMessage.error };
      }

      // Si c'est un message utilisateur, générer une réponse IA
      if (sender === 'user') {
        return await this.generateAIResponse(conversationId, content);
      }

      return { success: true, message: userMessage.message };
    } catch (error) {
      console.error('Erreur envoi message:', error);
      return { success: false, error: 'Erreur lors de l\'envoi du message' };
    }
  }

  private async generateAIResponse(
    conversationId: string,
    userMessage: string
  ): Promise<{ success: boolean; message?: SupportMessage; shouldEscalate?: boolean; error?: string }> {
    try {
      // Récupérer l'historique de la conversation
      const history = await this.getConversationHistory(conversationId);
      const conversationHistory = history.map(msg => 
        `${msg.sender}: ${msg.content}`
      );

      // Générer la réponse avec Mistral
      const mistralResponse = await this.mistralClient.generateResponse(
        userMessage,
        conversationHistory
      );

      // Sauvegarder la réponse IA
      const aiMessage = await this.saveMessage(
        conversationId,
        mistralResponse.content,
        'ai'
      );

      if (!aiMessage.success) {
        return { success: false, error: aiMessage.error };
      }

      // Si l'IA recommande une escalade, créer un ticket
      if (mistralResponse.shouldEscalate) {
        await this.escalateToTicket(conversationId, userMessage, mistralResponse.content);
      }

      return {
        success: true,
        message: aiMessage.message,
        shouldEscalate: mistralResponse.shouldEscalate
      };
    } catch (error) {
      console.error('Erreur génération réponse IA:', error);
      return { success: false, error: 'Erreur lors de la génération de la réponse' };
    }
  }

  private async saveMessage(
    conversationId: string,
    content: string,
    sender: 'user' | 'ai' | 'admin'
  ): Promise<{ success: boolean; message?: SupportMessage; error?: string }> {
    try {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await (supabase as any)
        .from('support_messages')
        .insert([{
          id: messageId,
          conversation_id: conversationId,
          content,
          sender,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur sauvegarde message:', error);
        return { success: false, error: error.message };
      }

      const message: SupportMessage = {
        id: data.id,
        content: data.content,
        sender: data.sender,
        timestamp: new Date(data.created_at),
        conversationId: data.conversation_id,
      };

      return { success: true, message };
    } catch (error) {
      console.error('Erreur saveMessage:', error);
      return { success: false, error: 'Erreur lors de la sauvegarde du message' };
    }
  }

  private async getConversationHistory(conversationId: string): Promise<SupportMessage[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('support_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erreur récupération historique:', error);
        return [];
      }

      return data.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.created_at),
        conversationId: msg.conversation_id,
      }));
    } catch (error) {
      console.error('Erreur getConversationHistory:', error);
      return [];
    }
  }

  private async escalateToTicket(
    conversationId: string,
    userMessage: string,
    aiResponse: string
  ): Promise<void> {
    try {
      const subject = `Support - Conversation ${conversationId}`;
      const description = `Message utilisateur: ${userMessage}\n\nRéponse IA: ${aiResponse}\n\nEscaladé automatiquement.`;

      // Récupérer les infos utilisateur de la conversation
      const { data: conversation } = await (supabase as any)
        .from('support_conversations')
        .select('user_id, user_email, user_name')
        .eq('id', conversationId)
        .single();

      await this.ticketService.createTicket(
        conversationId,
        subject,
        description,
        {
          userId: conversation?.user_id,
          userEmail: conversation?.user_email,
          userName: conversation?.user_name,
        }
      );

      // Mettre à jour le statut de la conversation
      await (supabase as any)
        .from('support_conversations')
        .update({ 
          status: 'escalated',
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Erreur escalade ticket:', error);
    }
  }

  async getConversation(conversationId: string): Promise<{ success: boolean; conversation?: SupportConversation; error?: string }> {
    try {
      const { data: conversation, error: convError } = await (supabase as any)
        .from('support_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError) {
        return { success: false, error: convError.message };
      }

      const messages = await this.getConversationHistory(conversationId);

      const fullConversation: SupportConversation = {
        id: conversation.id,
        userId: conversation.user_id,
        userEmail: conversation.user_email,
        userName: conversation.user_name,
        status: conversation.status,
        createdAt: new Date(conversation.created_at),
        updatedAt: new Date(conversation.updated_at),
        messages,
      };

      return { success: true, conversation: fullConversation };
    } catch (error) {
      console.error('Erreur getConversation:', error);
      return { success: false, error: 'Erreur lors de la récupération de la conversation' };
    }
  }
}