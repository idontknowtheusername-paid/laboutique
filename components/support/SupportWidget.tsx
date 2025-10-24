'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Ticket, CheckCircle } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { SupportConversation } from '@/types/support';
import { useAuth } from '@/contexts/AuthContext';
import { ChatService } from '@/lib/support/chat-service';

interface SupportWidgetProps {
  mistralApiKey: string;
}

export default function SupportWidget({ mistralApiKey }: SupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
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
    if (!conversation) return;

    setIsTyping(true);
    try {
      const result = await chatService.sendMessage(conversation.id, message);
      
      if (result.success && result.message) {
        // Mettre à jour la conversation avec le nouveau message
        const updatedConv = await chatService.getConversation(conversation.id);
        if (updatedConv.success && updatedConv.conversation) {
          setConversation(updatedConv.conversation);
        }

        // Si escalade, afficher notification
        if (result.shouldEscalate) {
          // Ici vous pouvez ajouter une notification toast
          console.log('Conversation escaladée vers un ticket');
        }
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
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
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Support Jomion
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
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
      />
    </>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}