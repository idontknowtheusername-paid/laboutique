'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Ticket, CheckCircle } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { SupportConversation } from '@/types/support';
import { useAuth } from '@/contexts/AuthContext';
import { ChatService } from '@/lib/support/chat-service';
import { cn } from '@/lib/utils';

interface SupportWidgetProps {
  mistralApiKey: string;
}

export default function SupportWidget({ mistralApiKey }: SupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatService] = useState(() => new ChatService(mistralApiKey));
  const { user } = useAuth();

  const initializeConversation = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await chatService.createConversation({
        userId: user?.id,
        userEmail: user?.email,
        userName: user?.user_metadata?.full_name || user?.email?.split('@')[0],
      });

      if (result.success && result.conversationId) {
        const convResult = await chatService.getConversation(result.conversationId);
        if (convResult.success && convResult.conversation) {
          setConversation(convResult.conversation);
        }
      }
    } catch (error) {
      console.error('Erreur initialisation conversation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [chatService, user]);

  useEffect(() => {
    if (isOpen && !conversation) {
      initializeConversation();
    }
  }, [isOpen, conversation, initializeConversation]);

  const handleSendMessage = async (message: string) => {
    console.log('handleSendMessage appelé avec:', message);
    console.log('Conversation actuelle:', conversation);
    
    // Réinitialiser l'erreur
    setError(null);
    
    // Si pas de conversation, en créer une d'abord
    if (!conversation) {
      console.log('Aucune conversation active - création...');
      setIsLoading(true);
      try {
        const result = await chatService.createConversation({
          userId: user?.id,
          userEmail: user?.email,
          userName: user?.user_metadata?.full_name || user?.email?.split('@')[0],
        });

        if (result.success && result.conversationId) {
          // Attendre un peu pour que la conversation soit bien créée
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const convResult = await chatService.getConversation(result.conversationId);
          if (convResult.success && convResult.conversation) {
            setConversation(convResult.conversation);
            // Maintenant envoyer le message
            await sendMessageToConversation(convResult.conversation.id, message);
          } else {
            console.error('Erreur récupération conversation:', convResult.error);
            setError('Problème de connexion, utilisation du mode de secours...');
            // Fallback: utiliser l'API Mistral directe
            await sendMessageDirectly(message);
          }
        } else {
          console.error('Erreur création conversation:', result.error);
          setError('Problème de connexion, utilisation du mode de secours...');
          // Fallback: utiliser l'API Mistral directe
          await sendMessageDirectly(message);
        }
      } catch (error) {
        console.error('Erreur création conversation:', error);
        setError('Problème de connexion, utilisation du mode de secours...');
        // Fallback: utiliser l'API Mistral directe
        await sendMessageDirectly(message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Envoyer le message à la conversation existante
    await sendMessageToConversation(conversation.id, message);
  };

  // Fonction de fallback pour utiliser l'API Mistral directe
  const sendMessageDirectly = async (message: string) => {
    console.log('Fallback: Envoi direct via API Mistral');
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/support/mistral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: conversation?.messages.map(m => `${m.sender}: ${m.content}`) || []
        })
      });

      const data = await response.json();
      console.log('Réponse API Mistral directe:', data);
      
      if (data.success && data.data && data.data.content) {
        // Créer un message temporaire pour l'affichage
        const tempMessage = {
          id: Date.now().toString(),
          content: data.data.content,
          sender: 'ai' as const,
          timestamp: new Date(),
          conversationId: 'temp',
          isTyping: false
        };
        
        // Mettre à jour l'état local
        setConversation(prev => prev ? {
          ...prev,
          messages: [...prev.messages, tempMessage]
        } : null);
      } else {
        console.error('Erreur API Mistral directe:', data.error);
        setError('Impossible de contacter l\'assistant. Veuillez réessayer plus tard.');
      }
    } catch (error) {
      console.error('Erreur fallback Mistral:', error);
      setError('Erreur de connexion. Veuillez réessayer plus tard.');
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessageToConversation = async (conversationId: string, message: string) => {
    console.log('Envoi du message:', message);
    setIsTyping(true);
    
    try {
      const result = await chatService.sendMessage(conversationId, message);
      console.log('Résultat envoi message:', result);
      
      if (result.success && result.message) {
        // Mettre à jour la conversation avec le nouveau message
        const updatedConv = await chatService.getConversation(conversationId);
        console.log('Conversation mise à jour:', updatedConv);
        
        if (updatedConv.success && updatedConv.conversation) {
          setConversation(updatedConv.conversation);
        }
        
        // Si escalade, afficher notification
        if (result.shouldEscalate) {
          console.log('Conversation escaladée vers un ticket');
        }
      } else {
        console.error('Erreur lors de l\'envoi du message:', result.error);
        setError('Problème de connexion, utilisation du mode de secours...');
        // Fallback vers l'API Mistral directe
        await sendMessageDirectly(message);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setError('Problème de connexion, utilisation du mode de secours...');
      // Fallback vers l'API Mistral directe
      await sendMessageDirectly(message);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null); // Réinitialiser l'erreur à la fermeture
  };

  const getStatusColor = () => {
    if (!conversation) return 'bg-jomionstore-primary';
    
    switch (conversation.status) {
      case 'active':
        return 'bg-green-500';
      case 'escalated':
        return 'bg-orange-500';
      case 'resolved':
        return 'bg-blue-500';
      default:
        return 'bg-jomionstore-primary';
    }
  };

  const getStatusIcon = () => {
    if (!conversation) return <MessageSquare className="w-5 h-5" />;
    
    switch (conversation.status) {
      case 'escalated':
        return <Ticket className="w-5 h-5" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  return (
    <>
      {/* Widget Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
            "bg-jomionstore-primary hover:bg-orange-700 text-white",
            "flex items-center justify-center relative group"
          )}
        >
          {getStatusIcon()}
          
          {/* Status indicator */}
          <div className={cn(
            "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
            getStatusColor()
          )} />
          
          {/* Tooltip */}
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-jomionstore-primary text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Support Jomion
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0 h-0 border-l-4 border-l-jomionstore-primary border-t-4 border-t-transparent border-b-4 border-b-transparent" />
          </div>
        </Button>
      </div>

      {/* Chat Window */}
      <ChatWindow
        conversation={conversation}
        onSendMessage={handleSendMessage}
        onClose={handleClose}
        isOpen={isOpen}
        isLoading={isLoading}
        isTyping={isTyping}
        error={error}
        onClearError={() => setError(null)}
      />
    </>
  );
}
