'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SupportMessage, SupportConversation } from '@/types/support';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Minimize2, Maximize2, MessageSquare, Ticket } from 'lucide-react';

interface ChatWindowProps {
  conversation: SupportConversation | null;
  onSendMessage: (message: string) => void;
  onClose: () => void;
  isOpen: boolean;
  isLoading?: boolean;
  isTyping?: boolean;
}

export default function ChatWindow({
  conversation,
  onSendMessage,
  onClose,
  isOpen,
  isLoading = false,
  isTyping = false
}: ChatWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, isTyping]);

  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      chatContainerRef.current.focus();
    }
  }, [isOpen]);

  const getStatusBadge = () => {
    if (!conversation) return null;
    
    switch (conversation.status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">En ligne</Badge>;
      case 'escalated':
        return <Badge variant="destructive">Ticket créé</Badge>;
      case 'resolved':
        return <Badge variant="secondary">Résolu</Badge>;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Chat Window */}
      <Card 
        ref={chatContainerRef}
        className={cn(
          "relative w-full max-w-md h-[600px] flex flex-col shadow-2xl border-0 bg-white",
          isMinimized ? "h-16" : "h-[600px]",
          "animate-in slide-in-from-bottom-4 duration-300"
        )}
      >
        {/* Header */}
        <CardHeader className="flex-shrink-0 pb-3 border-b bg-gradient-to-r from-jomionstore-primary to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-white">
                  Support Jomion
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-1">
              {isLoading && !conversation ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-jomionstore-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Connexion au support...</p>
                  </div>
                </div>
              ) : conversation?.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-1">Bonjour ! 👋</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Comment pouvons-nous vous aider aujourd'hui ?
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSendMessage("J'ai une question sur ma commande")}
                        className="w-full text-left justify-start"
                      >
                        Question sur ma commande
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSendMessage("Problème avec un produit")}
                        className="w-full text-left justify-start"
                      >
                        Problème avec un produit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSendMessage("Informations sur la livraison")}
                        className="w-full text-left justify-start"
                      >
                        Informations sur la livraison
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {conversation?.messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  
                  {isTyping && (
                    <MessageBubble
                      message={{
                        id: 'typing',
                        content: '',
                        sender: 'ai',
                        timestamp: new Date(),
                        conversationId: conversation?.id || '',
                        isTyping: true
                      }}
                    />
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>

            {/* Input */}
            <ChatInput
              onSendMessage={onSendMessage}
              disabled={isLoading || conversation?.status === 'escalated'}
              placeholder={
                conversation?.status === 'escalated' 
                  ? "Un ticket a été créé. Un agent vous contactera bientôt."
                  : "Tapez votre message..."
              }
            />
          </>
        )}
      </Card>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}