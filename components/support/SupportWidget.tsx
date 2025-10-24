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
  const [messages, setMessages] = useState<Array<{id: string, content: string, sender: 'user' | 'ai'}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketData, setTicketData] = useState({
    title: '',
    subject: '',
    userEmail: '',
    message: ''
  });
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
        // Créer un objet conversation minimal pour le tracking (sans messages)
        const newConversation = {
          id: result.conversationId,
          userId: user?.id,
          userEmail: user?.email,
          userName: user?.user_metadata?.full_name || user?.email?.split('@')[0],
          status: 'active' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: []
        };
        setConversation(newConversation);
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
    
    // Réinitialiser l'erreur
    setError(null);
    
    // Ajouter le message utilisateur en mémoire
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user' as const
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Si pas de conversation, en créer une d'abord (pour le tracking)
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
          // Créer un objet conversation minimal pour le tracking
          const newConversation = {
            id: result.conversationId,
            userId: user?.id,
            userEmail: user?.email,
            userName: user?.user_metadata?.full_name || user?.email?.split('@')[0],
            status: 'active' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            messages: []
          };
          setConversation(newConversation);
        }
      } catch (error) {
        console.error('Erreur création conversation:', error);
        // Continue même si la création échoue
      } finally {
        setIsLoading(false);
      }
    }

    // Envoyer le message via l'API Mistral directe
    await sendMessageDirectly(message);
  };

  // Fonction principale pour envoyer les messages via l'API Mistral directe
  const sendMessageDirectly = async (message: string) => {
    console.log('Envoi direct via API Mistral');
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/support/mistral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: messages.map(m => `${m.sender}: ${m.content}`)
        })
      });

      const data = await response.json();
      console.log('Réponse API Mistral:', data);
      
      if (data.success && data.data && data.data.content) {
        // Ajouter la réponse de l'IA en mémoire
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          content: data.data.content,
          sender: 'ai' as const
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Vérifier si l'IA suggère de créer un ticket
        if (data.data.shouldEscalate || shouldCreateTicket(data.data.content)) {
          // Préparer les données du ticket
          setTicketData({
            title: generateTicketTitle(message),
            subject: generateTicketSubject(message),
            userEmail: user?.email || '',
            message: message
          });
          setShowTicketModal(true);
        }
      } else {
        console.error('Erreur API Mistral:', data.error);
        setError('Impossible de contacter l\'assistant. Veuillez réessayer plus tard.');
      }
    } catch (error) {
      console.error('Erreur API Mistral:', error);
      setError('Erreur de connexion. Veuillez réessayer plus tard.');
    } finally {
      setIsTyping(false);
    }
  };


  const handleClose = () => {
    setIsOpen(false);
    setError(null); // Réinitialiser l'erreur à la fermeture
  };

  // Fonctions utilitaires pour la détection d'escalade
  const shouldCreateTicket = (aiResponse: string): boolean => {
    const escalationKeywords = [
      'créer un ticket', 'agent humain', 'escalader', 'ticket',
      'remboursement', 'plainte', 'problème', 'erreur', 'bug',
      'ne fonctionne pas', 'livraison', 'commande', 'paiement',
      'urgent', 'insatisfait', 'déçu', 'mauvais', 'cassé'
    ];
    
    return escalationKeywords.some(keyword => 
      aiResponse.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const generateTicketTitle = (userMessage: string): string => {
    if (userMessage.toLowerCase().includes('remboursement')) {
      return 'Demande de remboursement';
    } else if (userMessage.toLowerCase().includes('livraison')) {
      return 'Problème de livraison';
    } else if (userMessage.toLowerCase().includes('commande')) {
      return 'Question sur commande';
    } else if (userMessage.toLowerCase().includes('paiement')) {
      return 'Problème de paiement';
    } else {
      return 'Demande de support';
    }
  };

  const generateTicketSubject = (userMessage: string): string => {
    if (userMessage.toLowerCase().includes('remboursement')) {
      return 'Remboursement';
    } else if (userMessage.toLowerCase().includes('livraison')) {
      return 'Livraison';
    } else if (userMessage.toLowerCase().includes('commande')) {
      return 'Commande';
    } else if (userMessage.toLowerCase().includes('paiement')) {
      return 'Paiement';
    } else {
      return 'Support général';
    }
  };

  // Fonction pour créer le ticket
  const handleCreateTicket = async () => {
    if (!ticketData.userEmail || !ticketData.title || !ticketData.message) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      const response = await fetch('/api/support/create-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversation?.id || 'temp',
          title: ticketData.title,
          subject: ticketData.subject,
          userEmail: ticketData.userEmail,
          message: ticketData.message,
          userId: user?.id,
          userName: user?.user_metadata?.full_name || user?.email?.split('@')[0]
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Ajouter un message de confirmation
        const confirmationMessage = {
          id: Date.now().toString(),
          content: `✅ Ticket créé avec succès ! Un agent vous contactera à ${ticketData.userEmail} dans les 24h.`,
          sender: 'ai' as const
        };
        setMessages(prev => [...prev, confirmationMessage]);
        setShowTicketModal(false);
      } else {
        setError('Erreur lors de la création du ticket');
      }
    } catch (error) {
      console.error('Erreur création ticket:', error);
      setError('Erreur lors de la création du ticket');
    }
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
        messages={messages}
        onSendMessage={handleSendMessage}
        onClose={handleClose}
        isOpen={isOpen}
        isLoading={isLoading}
        isTyping={isTyping}
        error={error}
        onClearError={() => setError(null)}
      />

      {/* Modal de création de ticket */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎫 Créer un ticket de support
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={ticketData.title}
                  onChange={(e) => setTicketData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jomionstore-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sujet
                </label>
                <input
                  type="text"
                  value={ticketData.subject}
                  onChange={(e) => setTicketData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jomionstore-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={ticketData.userEmail}
                  onChange={(e) => setTicketData(prev => ({ ...prev, userEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jomionstore-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={ticketData.message}
                  onChange={(e) => setTicketData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jomionstore-primary"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowTicketModal(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateTicket}
                className="bg-jomionstore-primary hover:bg-orange-700"
              >
                Créer le ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
