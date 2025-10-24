'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface SimpleSupportWidgetProps {
  mistralApiKey: string;
}

export default function SimpleSupportWidget({ mistralApiKey }: SimpleSupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return;

    // Ajouter le message utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Appeler l'API Mistral
      const response = await fetch('/api/support/mistral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.map(m => `${m.sender}: ${m.content}`)
        })
      });

      const data = await response.json();
      
      if (data.success && data.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Message d'erreur
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Désolé, je rencontre un problème technique. Veuillez réessayer plus tard.',
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Désolé, je rencontre un problème technique. Veuillez réessayer plus tard.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
    }
  };

  const quickActions = [
    "J'ai une question sur ma commande",
    "Problème avec un produit",
    "Informations sur la livraison",
    "Retour ou remboursement"
  ];

  if (!mistralApiKey) return null;

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setIsOpen(true)}
            className={cn(
              "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
              "bg-jomionstore-primary hover:bg-jomionstore-primary/90 text-white",
              "flex items-center justify-center relative group"
            )}
            size="lg"
          >
            <MessageSquare className="w-6 h-6" />
            
            {/* Tooltip */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-jomionstore-primary text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50">
              Support Jomion
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0 h-0 border-l-4 border-l-jomionstore-primary border-t-4 border-t-transparent border-b-4 border-b-transparent" />
            </div>
          </Button>
        </div>
      )}

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat Window */}
          <Card className={cn(
            "relative w-full max-w-md h-[600px] flex flex-col shadow-2xl border-0 bg-white",
            isMinimized ? "h-16" : "h-[600px]",
            "animate-in slide-in-from-bottom-4 duration-300"
          )}>
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
                    <Badge variant="default" className="bg-green-100 text-green-800 mt-1">
                      En ligne
                    </Badge>
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
                    onClick={() => setIsOpen(false)}
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
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="font-medium text-gray-900 mb-1">Bonjour ! 👋</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Comment pouvons-nous vous aider aujourd'hui ?
                        </p>
                        <div className="space-y-2">
                          {quickActions.map((action, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => sendMessage(action)}
                              className="w-full text-left justify-start"
                            >
                              {action}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div key={message.id} className={cn(
                          'flex gap-3 mb-4',
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        )}>
                          {message.sender !== 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-jomionstore-primary/10 flex items-center justify-center">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                          )}
                          
                          <div className={cn(
                            'max-w-[80%] space-y-1',
                            message.sender === 'user' ? 'order-first' : 'order-last'
                          )}>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="font-medium">
                                {message.sender === 'user' ? 'Vous' : 'Support Jomion'}
                              </span>
                              <span>{message.timestamp.toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}</span>
                            </div>
                            
                            <div className={cn(
                              'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                              message.sender === 'user' 
                                ? 'bg-jomionstore-primary text-white rounded-br-md' 
                                : 'bg-gray-100 text-gray-900 border rounded-bl-md'
                            )}>
                              {isTyping && message.sender === 'ai' ? (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              )}
                            </div>
                          </div>
                          
                          {message.sender === 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-jomionstore-primary flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="flex gap-3 mb-4 justify-start">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-jomionstore-primary/10 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div className="bg-gray-100 text-gray-900 border rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>

                {/* Input */}
                <div className="flex-shrink-0 p-4 border-t">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Tapez votre message..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jomionstore-primary focus:border-transparent"
                      disabled={isLoading}
                    />
                    <Button 
                      type="submit" 
                      size="sm" 
                      disabled={!input.trim() || isLoading}
                      className="bg-jomionstore-primary hover:bg-jomionstore-primary/90"
                    >
                      Envoyer
                    </Button>
                  </form>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}