'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TestSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{id: string, content: string, sender: 'user' | 'ai'}>>([]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Ajouter le message utilisateur
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user' as const
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Simuler une réponse AI
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: `Merci pour votre message: "${message}". Comment puis-je vous aider ?`,
        sender: 'ai' as const
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
          <MessageSquare className="w-5 h-5" />
          
          {/* Tooltip */}
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-jomionstore-primary text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Support Jomion
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0 h-0 border-l-4 border-l-jomionstore-primary border-t-4 border-t-transparent border-b-4 border-b-transparent" />
          </div>
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat Window */}
          <div className="relative w-full max-w-md h-[600px] flex flex-col shadow-2xl border-0 bg-white rounded-lg">
            {/* Header */}
            <div className="flex-shrink-0 pb-3 border-b bg-gradient-to-r from-jomionstore-primary to-orange-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Support Jomion - TEST
                    </h3>
                    <span className="text-sm text-white/80">En ligne</span>
                  </div>
                </div>
                
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-1">Bonjour ! 👋</h3>
                    <p className="text-sm text-gray-500">
                      Ceci est un test du widget de support. Tapez un message ci-dessous.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={cn(
                    'flex gap-3',
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}>
                    <div className={cn(
                      'max-w-[80%] px-4 py-3 rounded-2xl text-sm',
                      msg.sender === 'user' 
                        ? 'bg-jomionstore-primary text-white rounded-br-md' 
                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="border-t bg-white p-4 rounded-b-lg">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tapez votre message..."
                    className="w-full min-h-[44px] max-h-[120px] resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jomionstore-primary focus:border-transparent"
                    rows={1}
                  />
                </div>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="h-11 w-11 p-0 bg-jomionstore-primary hover:bg-orange-700 disabled:opacity-50"
                >
                  Envoyer
                </Button>
              </div>
              
              <div className="mt-2 text-xs text-gray-500 text-center">
                Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}