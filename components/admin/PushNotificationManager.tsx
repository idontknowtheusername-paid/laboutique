'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Send, Users, Target, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'promotion' | 'order' | 'system';
  target: 'all' | 'customers' | 'vendors' | 'admins';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduled_at?: string;
  sent_at?: string;
  recipients_count: number;
  opened_count: number;
  created_at: string;
}

export default function PushNotificationManager() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    target: 'all' as const,
    scheduled_at: ''
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Simuler des notifications push
      const mockNotifications: PushNotification[] = [
        {
          id: '1',
          title: 'Nouvelle promotion !',
          message: 'Jusqu\'à 50% de réduction sur tous les produits électroniques',
          type: 'promotion',
          target: 'customers',
          status: 'sent',
          sent_at: '2024-01-15T10:30:00Z',
          recipients_count: 1250,
          opened_count: 312,
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          title: 'Commande expédiée',
          message: 'Votre commande #12345 a été expédiée et sera livrée sous 2-3 jours',
          type: 'order',
          target: 'customers',
          status: 'sent',
          sent_at: '2024-01-14T14:20:00Z',
          recipients_count: 1,
          opened_count: 1,
          created_at: '2024-01-14T14:15:00Z'
        },
        {
          id: '3',
          title: 'Maintenance programmée',
          message: 'Le site sera en maintenance demain de 2h à 4h du matin',
          type: 'system',
          target: 'all',
          status: 'scheduled',
          scheduled_at: '2024-01-16T02:00:00Z',
          recipients_count: 0,
          opened_count: 0,
          created_at: '2024-01-14T16:00:00Z'
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) return;

    setLoading(true);
    try {
      const notification: PushNotification = {
        id: Date.now().toString(),
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        target: newNotification.target,
        status: newNotification.scheduled_at ? 'scheduled' : 'sent',
        scheduled_at: newNotification.scheduled_at || undefined,
        sent_at: newNotification.scheduled_at ? undefined : new Date().toISOString(),
        recipients_count: 0,
        opened_count: 0,
        created_at: new Date().toISOString()
      };

      setNotifications(prev => [notification, ...prev]);
      setNewNotification({ title: '', message: '', type: 'info', target: 'all', scheduled_at: '' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-orange-100 text-orange-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'promotion': return <Target className="w-4 h-4 text-orange-500" />;
      case 'order': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'system': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-orange-500" />;
    }
  };

  const getOpenRate = (notification: PushNotification) => {
    if (notification.recipients_count === 0) return 0;
    return Math.round((notification.opened_count / notification.recipients_count) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notifications Push</h2>
          <p className="text-gray-500">Gérez les notifications push pour vos utilisateurs</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Send className="w-4 h-4 mr-2" />
          Nouvelle notification
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Modèles</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Historique des notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cible
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {notifications.map((notification) => (
                      <tr key={notification.id}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium">{notification.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {notification.message}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(notification.type)}
                            <span className="capitalize">{notification.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-orange-100 text-orange-800">
                            {notification.target}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(notification.status)}>
                            {notification.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div>{notification.recipients_count} envoyées</div>
                            <div className="text-gray-500">
                              {notification.opened_count} ouvertes ({getOpenRate(notification)}%)
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(notification.sent_at || notification.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  Promotion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">Nouvelle promotion !</div>
                  <div className="text-sm text-gray-500">
                    Jusqu'à 50% de réduction sur tous les produits électroniques
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    Utiliser ce modèle
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Commande
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">Commande expédiée</div>
                  <div className="text-sm text-gray-500">
                    Votre commande a été expédiée et sera livrée sous 2-3 jours
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    Utiliser ce modèle
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">Maintenance</div>
                  <div className="text-sm text-gray-500">
                    Le site sera en maintenance demain de 2h à 4h du matin
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    Utiliser ce modèle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Notifications envoyées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1,247</div>
                <p className="text-sm text-gray-500">+15% ce mois</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Taux d'ouverture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">68%</div>
                <p className="text-sm text-gray-500">+3% ce mois</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Clics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">312</div>
                <p className="text-sm text-gray-500">+8% ce mois</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Abonnés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2,456</div>
                <p className="text-sm text-gray-500">+12% ce mois</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nouvelle notification</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Titre</label>
                <Input
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  placeholder="Titre de la notification"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  placeholder="Message de la notification"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <Select
                    value={newNotification.type}
                    onValueChange={(value: any) => setNewNotification({ ...newNotification, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="order">Commande</SelectItem>
                      <SelectItem value="system">Système</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cible</label>
                  <Select
                    value={newNotification.target}
                    onValueChange={(value: any) => setNewNotification({ ...newNotification, target: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="customers">Clients</SelectItem>
                      <SelectItem value="vendors">Vendeurs</SelectItem>
                      <SelectItem value="admins">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Programmer (optionnel)</label>
                <Input
                  type="datetime-local"
                  value={newNotification.scheduled_at}
                  onChange={(e) => setNewNotification({ ...newNotification, scheduled_at: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSendNotification}
                  disabled={loading || !newNotification.title.trim() || !newNotification.message.trim()}
                >
                  {loading ? 'Envoi...' : 'Envoyer'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}