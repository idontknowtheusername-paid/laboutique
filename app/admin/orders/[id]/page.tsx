'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrdersService, Order } from '@/lib/services/orders.service';
import { ArrowLeft, Edit, Download, Mail, Phone } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = Array.isArray(params?.id) ? params?.id[0] : (params as any)?.id;
  const [loading, setLoading] = React.useState(true);
  const [order, setOrder] = React.useState<Order | null>(null);
  const [updating, setUpdating] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Récupérer les détails de la commande
        const { data, error } = await (OrdersService as any).getSupabaseClient()
          .from('orders')
          .select(`
            *,
            user:profiles!orders_user_id_fkey(*),
            order_items(
              *,
              product:products(*),
              vendor:profiles!order_items_vendor_id_fkey(*)
            )
          `)
          .eq('id', orderId)
          .single();

        if (!error && data) {
          setOrder(data as Order);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la commande:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  const handleStatusUpdate = async (newStatus: string) => {
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
        setOrder({ ...order, status: newStatus });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
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
      <div className="min-h-screen bg-jomiastore-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jomiastore-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-jomiastore-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Commande introuvable</h1>
          <Button onClick={() => window.history.back()}>
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
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <Button 
              className="bg-jomiastore-primary hover:bg-blue-700"
              onClick={() => window.location.href = `/admin/orders/${order.id}/edit`}
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la commande</CardTitle>
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
                  <label className="text-sm font-medium text-gray-500">Statut</label>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Montant total</label>
                  <p className="text-xl font-bold text-green-600">{formatPrice(order.total_amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Articles de la commande */}
          <Card>
            <CardHeader>
              <CardTitle>Articles commandés</CardTitle>
            </CardHeader>
            <CardContent>
              {order.order_items && order.order_items.length > 0 ? (
                <div className="space-y-4">
                  {order.order_items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500">📦</span>
                        </div>
                        <div>
                          <p className="font-medium">{item.product?.name || 'Produit supprimé'}</p>
                          <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                          <p className="text-sm text-gray-500">Vendeur: {item.vendor?.name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                        <p className="text-sm text-gray-500">{formatPrice(item.price)} × {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucun article trouvé</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client */}
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-jomiastore-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {(order.user?.first_name || order.user?.email || '?')[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {order.user?.first_name} {order.user?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{order.user?.email}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-1" />
                  Appeler
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleStatusUpdate('processing')}
                disabled={updating || order.status === 'processing'}
              >
                Marquer en cours
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleStatusUpdate('shipped')}
                disabled={updating || order.status === 'shipped'}
              >
                Marquer expédiée
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleStatusUpdate('delivered')}
                disabled={updating || order.status === 'delivered'}
              >
                Marquer livrée
              </Button>
              <Button 
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50" 
                variant="outline"
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={updating || order.status === 'cancelled'}
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
                onClick={() => {
                  // Logique d'export
                  console.log('Export commande', order.id);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}