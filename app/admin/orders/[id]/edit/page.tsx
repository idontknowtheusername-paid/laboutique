'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { OrdersService } from '@/lib/services/orders.service';

export default function AdminEditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Array.isArray(params?.id) ? params?.id[0] : (params as any)?.id;
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [order, setOrder] = React.useState<any>(null);
  const [message, setMessage] = React.useState('');

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
          setOrder(data);
        }
      } catch (error) {
        // L'erreur sera gérée par l'état loading et l'affichage conditionnel
        console.error('Erreur lors du chargement de la commande:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  const handleSave = async () => {
    if (!order) return;
    
    setSaving(true);
    setMessage('');
    
    try {
      const { error } = await (OrdersService as any).getSupabaseClient()
        .from('orders')
        .update({
          status: order.status,
          notes: order.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (!error) {
        setMessage('Commande mise à jour avec succès !');
        setTimeout(() => {
          router.push(`/admin/orders/${order.id}`);
        }, 2000);
      } else {
        setMessage('Erreur lors de la mise à jour');
      }
    } catch (error) {
      setMessage('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

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
        title={`Modifier la commande ${order.order_number || order.id}`}
        subtitle="Édition des informations de la commande"
        actions={
          <div className="flex items-center gap-2">
            {message && (
              <Badge className={message.includes('succès') ? 'bg-green-600' : 'bg-red-600'}>
                {message}
              </Badge>
            )}
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push(`/admin/orders/${order.id}`)}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button 
              className="bg-jomionstore-primary hover:bg-orange-700"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations principales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de la commande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Numéro de commande</label>
                <Input value={order.order_number || order.id} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date de commande</label>
                <Input 
                  value={new Date(order.created_at).toLocaleDateString('fr-FR')} 
                  readOnly 
                  className="bg-gray-50" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Statut</label>
                <Select 
                  value={order.status} 
                  onValueChange={(value) => setOrder({ ...order, status: value })}
                >
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
                <label className="block text-sm font-medium mb-2">Montant total</label>
                <Input 
                  value={formatPrice(order.total_amount)} 
                  readOnly 
                  className="bg-gray-50 font-bold" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Notes internes</label>
              <Textarea 
                value={order.notes || ''} 
                onChange={(e) => setOrder({ ...order, notes: e.target.value })}
                placeholder="Ajoutez des notes internes sur cette commande..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Client */}
        <Card>
          <CardHeader>
            <CardTitle>Informations client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-jomionstore-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-lg">
                  {(order.user?.first_name || order.user?.email || '?')[0]}
                </span>
              </div>
              <div>
                <p className="font-medium text-lg">
                  {order.user?.first_name} {order.user?.last_name}
                </p>
                <p className="text-sm text-gray-500">{order.user?.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input value={order.user?.email || ''} readOnly className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Téléphone</label>
                <Input value={order.user?.phone || 'Non renseigné'} readOnly className="bg-gray-50" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Articles de la commande */}
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
    </div>
  );
}