'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Ticket, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { SupportTicket, SupportConversation } from '@/types/support';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    urgentTickets: 0,
    totalConversations: 0,
    activeConversations: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les tickets
      const ticketsResponse = await fetch('/api/support/tickets');
      const ticketsData = await ticketsResponse.json();
      
      if (ticketsData.success) {
        setTickets(ticketsData.tickets || []);
      }

      // Calculer les statistiques
      const totalTickets = ticketsData.tickets?.length || 0;
      const openTickets = ticketsData.tickets?.filter((t: SupportTicket) => t.status === 'open').length || 0;
      const urgentTickets = ticketsData.tickets?.filter((t: SupportTicket) => t.priority === 'urgent').length || 0;

      setStats({
        totalTickets,
        openTickets,
        urgentTickets,
        totalConversations: 0, // À implémenter si nécessaire
        activeConversations: 0, // À implémenter si nécessaire
      });

    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: SupportTicket['status']) => {
    try {
      const response = await fetch('/api/support/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status }),
      });

      if (response.ok) {
        loadData(); // Recharger les données
      }
    } catch (error) {
      console.error('Erreur mise à jour ticket:', error);
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-jomionstore-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Jomion</h1>
        <p className="text-gray-600">Gestion des tickets et conversations de support</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Ticket className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tickets Ouverts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.openTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.urgentTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Tickets de Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun ticket pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>ID: {ticket.id}</span>
                        <span>•</span>
                        <span>Créé: {ticket.createdAt.toLocaleDateString('fr-FR')}</span>
                        {ticket.userEmail && (
                          <>
                            <span>•</span>
                            <span>Email: {ticket.userEmail}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                        disabled={ticket.status === 'in_progress'}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        En cours
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                        disabled={ticket.status === 'resolved'}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Résolu
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTicketStatus(ticket.id, 'closed')}
                        disabled={ticket.status === 'closed'}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Fermé
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}