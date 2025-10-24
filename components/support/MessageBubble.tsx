'use client';

import React from 'react';
import { SupportMessage } from '@/types/support';
import { Bot, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: SupportMessage;
  isTyping?: boolean;
}

export default function MessageBubble({ message, isTyping = false }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';
  const isAdmin = message.sender === 'admin';

  const getIcon = () => {
    if (isUser) return <User className="w-4 h-4" />;
    if (isAI) return <Bot className="w-4 h-4" />;
    if (isAdmin) return <Shield className="w-4 h-4" />;
    return null;
  };

  const getSenderName = () => {
    if (isUser) return 'Vous';
    if (isAI) return 'Support Jomion';
    if (isAdmin) return 'Agent';
    return 'Inconnu';
  };

  const getSenderColor = () => {
    if (isUser) return 'bg-jomionstore-primary text-white';
    if (isAI) return 'bg-gray-100 text-gray-900 border';
    if (isAdmin) return 'bg-blue-100 text-blue-900 border border-blue-200';
    return 'bg-gray-100 text-gray-900';
  };

  return (
    <div className={cn(
      'flex gap-3 mb-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-jomionstore-primary/10 flex items-center justify-center">
          {getIcon()}
        </div>
      )}
      
      <div className={cn(
        'max-w-[80%] space-y-1',
        isUser ? 'order-first' : 'order-last'
      )}>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-medium">{getSenderName()}</span>
          <span>{message.timestamp.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</span>
        </div>
        
        <div className={cn(
          'px-4 py-3 rounded-2xl text-sm leading-relaxed',
          getSenderColor(),
          isUser ? 'rounded-br-md' : 'rounded-bl-md'
        )}>
          {isTyping ? (
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
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-jomionstore-primary flex items-center justify-center">
          {getIcon()}
        </div>
      )}
    </div>
  );
}