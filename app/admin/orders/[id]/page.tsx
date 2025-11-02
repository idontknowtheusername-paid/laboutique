'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrdersService, Order } from '@/lib/services/orders.service';
import { ArrowLeft, Edit, Download, Mail, Phone, Clock, MapPin, Truck, Package, User, CreditCard, MessageSquare, History, Bell } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import OrderTracking from '@/components/admin/OrderTracking';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Array.isArray(params?.id) ? params?.id[0] : (params as any)?.id;
  const [loading, setLoading] = React.useState(true);
  const [order, setOrder] = React.useState<Order | null>(null);
  const [updating, setUpdating] = React.useState(false);
  const [orderHistory, setOrderHistory] = React.useState<any[]>([]);
  const [newNote, setNewNote] = React.useState('');
  const [addingNote, setAddingNote] = React.useState(false);
  const [showStatusModal, setShowStatusModal] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState('');
  const [statusReason, setStatusReason] = React.useState('');

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        console.log('🔍 [DEBUG] Chargement commande ID:', orderId);

        // Essayer d'abord une requête simple sans relations
        const { data: simpleData, error: simpleError } = await (OrdersService as any).getSupabaseClient()
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        console.log('🔍 [DEBUG] Requête simple:', { data: simpleData, error: simpleError });

        if (simpleError) {
          console.error('❌ [DEBUG] Erreur requête simple:', simpleError);
          return;
        }

        if (!simpleData) {
          console.error('❌ [DEBUG] Aucune commande trouvée avec ID:', orderId);
          return;
        }

        // Si la requête simple fonctionne, essayer avec les relations
        const { data, error } = await (OrdersService as any).getSupabaseClient()
          .from('orders')
          .select(`
            *,
            order_items(
              *,
              product:products(id, name, slug, images, price)
            )
          `)
          .eq('id', orderId)
          .single();

        // Récupérer les infos utilisateur séparément depuis la table profiles
        let userData = null;
        if (simpleData?.user_id) {
          const { data: userProfile } = await (OrdersService as any).getSupabaseClient()
            .from('profiles')
            .select('id, email, first_name, last_name, phone')
            .eq('id', simpleData.user_id)
            .single();
          userData = userProfile;
        }

        console.log('🔍 [DEBUG] Requête avec relations:', { data, error });

        if (!error && data) {
          // Ajouter les infos utilisateur aux données de la commande
          const orderWithUser = {
            ...data,
            user: userData
          };
          setOrder(orderWithUser as Order);
          console.log('✅ [DEBUG] Commande chargée avec succès');
          console.log('🏠 [DEBUG] Adresse de livraison:', orderWithUser.shipping_address);
          console.log('👤 [DEBUG] Données utilisateur:', userData);
        } else {
          console.error('❌ [DEBUG] Erreur avec relations:', error);
          // Utiliser les données simples en fallback avec les infos utilisateur
          const orderWithUser = {
            ...simpleData,
            user: userData,
            order_items: []
          };
          setOrder(orderWithUser as Order);
        }
      } catch (error) {
        console.error('💥 [DEBUG] Erreur catch:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  const handleStatusUpdate = async (newStatus: string, reason?: string) => {
    if (!order) return;
    
    setUpdating(true);
    try {
      const { error } = await (OrdersService as any).getSupabaseClient()
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (!error) {
        // Ajouter à l'historique
        await (OrdersService as any).getSupabaseClient()
          .from('order_history')
          .insert({
            order_id: order.id,
            status_from: order.status,
            status_to: newStatus,
            reason: reason || '',
            created_at: new Date().toISOString()
          });

        setOrder({ ...order, status: newStatus as Order['status'] });
        
        // Recharger l'historique
        const { data: historyData } = await (OrdersService as any).getSupabaseClient()
          .from('order_history')
          .select('*')
          .eq('order_id', order.id)
          .order('created_at', { ascending: false });
          
        if (historyData) {
          setOrderHistory(historyData);
        }
      }
    } catch (error) {
      // L'erreur sera gérée par l'état updating et l'affichage conditionnel
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!order || !newNote.trim()) return;
    
    setAddingNote(true);
    try {
      const { error } = await (OrdersService as any).getSupabaseClient()
        .from('order_notes')
        .insert({
          order_id: order.id,
          note: newNote.trim(),
          created_at: new Date().toISOString()
        });

        if (!error) {
          setNewNote('');
          // Recharger les données
          router.refresh();
        }
    } catch (error) {
      // L'erreur sera gérée par l'état addingNote et l'affichage conditionnel
      console.error('Erreur lors de l\'ajout de la note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  // Fonction supprimée - logique intégrée dans les boutons

  const handleExportPDF = () => {
    if (!order) return;
    
    try {
      // Créer le contenu HTML pour le PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Commande ${order?.order_number || order?.id || 'N/A'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .info-item { margin-bottom: 10px; }
            .info-label { font-weight: bold; color: #666; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f5f5f5; }
            .total { font-size: 18px; font-weight: bold; color: #2e7d32; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Commande ${order.order_number || order.id}</h1>
            <p>Date: ${new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
          
          <div class="section">
            <h3>Informations de la commande</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Numéro:</div>
                <div>${order.order_number || order.id}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Statut:</div>
                <div>${order.status}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Montant total:</div>
                <div class="total">${formatPrice(order.total_amount)}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h3>Informations client</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Nom:</div>
                <div>${order.user?.first_name} ${order.user?.last_name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email:</div>
                <div>${order.user?.email}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h3>Articles commandés</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.order_items?.map((item: any) => `
                  <tr>
                    <td>${item.product?.name || 'Produit supprimé'}</td>
                    <td>${item.quantity}</td>
                    <td>${formatPrice(item.price)}</td>
                    <td>${formatPrice(item.price * item.quantity)}</td>
                  </tr>
                `).join('') || '<tr><td colspan="4">Aucun article</td></tr>'}
              </tbody>
            </table>
          </div>
        </body>
        </html>
      `;

      // Ouvrir une nouvelle fenêtre avec le contenu HTML
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    } catch (err) {
      // L'erreur sera gérée par l'affichage conditionnel
      console.error('Erreur lors de l\'export PDF:', err);
    }
  };

  const handleSendEmail = async () => {
    if (!order || !order.user?.email) {
      alert('Email du client non disponible');
      return;
    }

    try {
      // Utiliser le service Brevo pour envoyer l'email
      const response = await fetch('/api/admin/orders/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.order_number || order.id,
          customerEmail: order.user.email,
          customerName: `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim(),
          status: order.status,
          totalAmount: order.total_amount,
          orderDate: order.created_at
        })
      });

      if (response.ok) {
        alert('Email envoyé avec succès !');
      } else {
    // Fallback vers mailto si l'API échoue
        const subject = `Commande ${order.order_number || order.id} - JomionStore`;
        const body = `Bonjour ${order.user.first_name || ''} ${order.user.last_name || ''},

Votre commande ${order.order_number || order.id} a été traitée.

Détails de la commande:
- Numéro: ${order.order_number || order.id}
- Statut: ${order.status}
- Montant total: ${formatPrice(order.total_amount)}
- Date: ${new Date(order.created_at).toLocaleDateString('fr-FR')}

Merci pour votre confiance.

L'équipe JomionStore`;

        const mailtoLink = `mailto:${order.user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
      }
    } catch (error) {
      console.error('Erreur envoi email:', error);
      alert('Erreur lors de l\'envoi de l\'email');
    }
  };

  // Fonction supprimée - pas besoin du bouton d'appel

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-orange-500';
      case 'shipped': return 'bg-indigo-500';
      case 'delivered': return 'bg-green-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('fr-BJ', {
    style: 'currency', currency: 'XOF', minimumFractionDigits: 0,
  }).format(price);

  if (loading) {
    return (
      <div className="min-h-screen bg-jomionstore-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jomionstore-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-jomionstore-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Commande introuvable</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Commande ${order.order_number || order.id}`}
        subtitle="Détails et gestion de la commande"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <Button 
              className="bg-jomionstore-primary hover:bg-orange-700"
              onClick={() => router.push(`/admin/orders/${order.id}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="items">Articles</TabsTrigger>
          <TabsTrigger value="tracking">Suivi</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations principales */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Informations de la commande
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Numéro de commande</label>
                      <p className="text-lg font-semibold">{order.order_number || order.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date de commande</label>
                      <p className="text-lg">{new Date(order.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Statut actuel</label>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setNewStatus(order.status);
                            setShowStatusModal(true);
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Modifier
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Montant total</label>
                      <p className="text-xl font-bold text-green-600">{formatPrice(order.total_amount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Adresses de livraison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Adresses de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Adresse de livraison uniquement */}
                  <div>
                    {order.shipping_address ? (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">Client: </span>
                            <span>{order.user?.first_name && order.user?.last_name
                              ? `${order.user.first_name} ${order.user.last_name}`
                              : order.user?.email || 'Client inconnu'
                            }</span>
                          </div>

                          <div>
                            <span className="font-medium text-gray-700">Adresse: </span>
                            <span>{order.shipping_address.address || 'Non spécifiée'}</span>
                          </div>

                          <div>
                            <span className="font-medium text-gray-700">Ville: </span>
                            <span>{order.shipping_address.city || 'Non spécifiée'}</span>
                          </div>

                          <div>
                            <span className="font-medium text-gray-700">Pays: </span>
                            <span>{order.shipping_address.country || 'Bénin'}</span>
                          </div>

                          <div>
                            <span className="font-medium text-gray-700">Téléphone: </span>
                            <span>{order.shipping_address.phone || order.user?.phone || 'Non spécifié'}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 font-medium">⚠️ Adresse de livraison manquante</p>
                        <p className="text-red-500 text-sm">Cette commande ne peut pas être traitée sans adresse de livraison.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Client */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informations client
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-jomionstore-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-lg">
                        {(order.user?.first_name || order.user?.email || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-lg">
                        {order.user?.first_name && order.user?.last_name
                          ? `${order.user.first_name} ${order.user.last_name}`
                          : order.user?.email || 'Client inconnu'
                        }
                      </p>
                      <p className="text-sm text-gray-500">{order.user?.email || 'Email non disponible'}</p>
                      {order.user?.phone && (
                        <p className="text-sm text-gray-500">{order.user.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendEmail}
                      disabled={!order.user?.email}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Envoyer un email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions rapides */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Actions rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      setNewStatus('processing');
                      setShowStatusModal(true);
                    }}
                    disabled={updating || order.status === 'processing' || order.status === 'delivered' || order.status === 'cancelled'}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Marquer en cours
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      setNewStatus('shipped');
                      setShowStatusModal(true);
                    }}
                    disabled={updating || order.status === 'shipped' || order.status === 'delivered' || order.status === 'cancelled' || order.status === 'pending'}
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Marquer expédiée
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      setNewStatus('delivered');
                      setShowStatusModal(true);
                    }}
                    disabled={updating || order.status === 'delivered' || order.status === 'cancelled' || order.status === 'pending'}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Marquer livrée
                  </Button>
                  <Button 
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50" 
                    variant="outline"
                    onClick={() => {
                      setNewStatus('cancelled');
                      setShowStatusModal(true);
                    }}
                    disabled={updating || order.status === 'cancelled' || order.status === 'delivered'}
                  >
                    Annuler la commande
                  </Button>
                </CardContent>
              </Card>

              {/* Export */}
              <Card>
                <CardHeader>
                  <CardTitle>Export</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleExportPDF}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter PDF
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Articles de la commande</CardTitle>
            </CardHeader>
            <CardContent>
              {order.order_items && order.order_items.length > 0 ? (
                <div className="space-y-4">
                  {order.order_items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 text-2xl">📦</span>
                        </div>
                        <div>
                          <p className="font-medium text-lg">{item.product?.name || 'Produit supprimé'}</p>
                          <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                          <p className="text-sm text-gray-500">Vendeur: {item.vendor?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">Prix unitaire: {formatPrice(item.price)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatPrice(item.price * item.quantity)}</p>
                        <p className="text-sm text-gray-500">Total</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucun article trouvé</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking">
          <OrderTracking 
            orderId={order.id}
            currentStatus={order.status}
          />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Historique des modifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderHistory.length > 0 ? (
                <div className="space-y-4">
                  {orderHistory.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          Statut changé de <span className="text-red-600">{entry.status_from}</span> vers <span className="text-green-600">{entry.status_to}</span>
                        </p>
                        {entry.reason && (
                          <p className="text-sm text-gray-500">Raison: {entry.reason}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(entry.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucun historique disponible</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Notes internes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Ajouter une note interne..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={handleAddNote}
                  disabled={addingNote || !newNote.trim()}
                  className="self-start"
                >
                  {addingNote ? 'Ajout...' : 'Ajouter'}
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                Les notes internes ne sont visibles que par l'équipe d'administration.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de changement de statut */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Changer le statut de la commande</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nouveau statut</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="processing">En cours</SelectItem>
                    <SelectItem value="shipped">Expédiée</SelectItem>
                    <SelectItem value="delivered">Livrée</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Raison (optionnel)</label>
                <Textarea
                  placeholder="Expliquez le changement de statut..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowStatusModal(false)}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={() => {
                    handleStatusUpdate(newStatus, statusReason);
                    setShowStatusModal(false);
                    setStatusReason('');
                  }}
                  disabled={updating}
                >
                  {updating ? 'Mise à jour...' : 'Confirmer'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}