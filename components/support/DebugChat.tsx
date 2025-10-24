'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugChat() {
  const [messages, setMessages] = useState<Array<{id: string, content: string, sender: 'user' | 'ai'}>>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Ajouter le message utilisateur
    const userMessage = {
      id: Date.now().toString(),
      content: input,
      sender: 'user' as const
    };
    setMessages(prev => [...prev, userMessage]);

    // Simuler une réponse IA
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: `Réponse IA pour: "${input}"`,
        sender: 'ai' as const
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);

    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white border rounded-lg shadow-lg flex flex-col">
      <CardHeader className="bg-blue-500 text-white">
        <CardTitle>Debug Chat</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {messages.map(msg => (
            <div key={msg.id} className={`p-2 rounded ${
              msg.sender === 'user' 
                ? 'bg-blue-500 text-white ml-auto max-w-[80%]' 
                : 'bg-gray-200 text-black mr-auto max-w-[80%]'
            }`}>
              {msg.content}
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 mt-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 border rounded px-2 py-1"
            placeholder="Tapez un message..."
          />
          <Button onClick={sendMessage} size="sm">Envoyer</Button>
        </div>
      </CardContent>
    </div>
  );
}