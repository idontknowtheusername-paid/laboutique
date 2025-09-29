 "use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OrdersService, Order } from "@/lib/services";
import { DeliveryService, DeliveryUpdate, Carrier } from "@/lib/services/delivery.service";
import { useCart } from "@/contexts/CartContext";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from '@/components/ui/toast';
// Seuls les statuts accessibles à l'utilisateur final
const USER_STATUSES = [
  "delivered",
  "cancelled"
];
import Link from "next/link";
import NextImage from "next/image";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<{ tracking_number?: string; carrier?: string; estimated_delivery?: string } | null>(null);
  const [updates, setUpdates] = useState<DeliveryUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { addToCart } = useCart();
  const [carriers, setCarriers] = useState<Carrier[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
    // eslint-disable-next-line
  }, [params.id]);

  useEffect(() => {
    (async () => {
      const c = await DeliveryService.getCarriers();
      if (c.success && c.data) setCarriers(c.data);
    })();
  }, []);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await OrdersService.getById(params.id);
      if (response.success && response.data) {
        setOrder(response.data);
        const deliveryRes = await DeliveryService.getByOrderId(response.data.id);
        if (deliveryRes.success && deliveryRes.data) {
          const d = deliveryRes.data.delivery;
          setTracking({ tracking_number: d.tracking_number, carrier: d.carrier, estimated_delivery: d.estimated_delivery });
          setUpdates(deliveryRes.data.updates || []);
        }
      } else {
        setError(response.error || "Commande introuvable");
      }
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement de la commande");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async () => {
    if (!order) return;
    for (const item of order.order_items || []) {
      if (item.product) {
        await addToCart(item.product.id, item.product.name, item.price, item.quantity);
      }
    }
    // Redirect to cart
    router.push('/cart');
  };

  const getTrackingExternalUrl = () => {
    if (!tracking?.tracking_number || !tracking?.carrier) return null;
    const match = carriers.find(c => c.name.toLowerCase() === (tracking.carrier || '').toLowerCase() || c.code.toLowerCase() === (tracking.carrier || '').toLowerCase());
    if (!match?.tracking_url_template) return null;
    const t = tracking.tracking_number;
    return match.tracking_url_template
      .replace('{trackingNumber}', t)
      .replace('{tracking_number}', t)
      .replace('{TRACKING_NUMBER}', t);
  };

  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string|null>(null);
  const { addToast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    if (!window.confirm(`Confirmer le changement de statut vers "${newStatus}" ?`)) return;
    setUpdating(true);
    setUpdateError(null);
    try {
      const response = await OrdersService.updateStatus(order.id, newStatus as any);
      if (response.success && response.data) {
        setOrder(response.data);
        addToast({
          type: 'success',
          title: 'Statut mis à jour',
          description: `Le statut de la commande est maintenant "${newStatus}".`
        });
      } else {
        setUpdateError(response.error || "Erreur lors de la mise à jour du statut");
        addToast({
          type: 'error',
          title: 'Erreur',
          description: response.error || "Erreur lors de la mise à jour du statut"
        });
      }
    } catch (e: any) {
      setUpdateError(e.message || "Erreur lors de la mise à jour du statut");
      addToast({
        type: 'error',
        title: 'Erreur',
        description: e.message || "Erreur lors de la mise à jour du statut"
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="mb-4 text-red-600">{error || "Commande introuvable"}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/account/orders">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour à mes commandes
          </Link>
        </Button>
  <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Commande #{order.order_number}</span>
              <Badge>{order.status}</Badge>
            </CardTitle>
            {updateError && (
              <div className="text-red-600 text-sm mt-2">{updateError}</div>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {USER_STATUSES.filter(s => s !== order.status).map(s => (
                <Button
                  key={s}
                  size="sm"
                  variant="outline"
                  disabled={updating}
                  onClick={() => handleStatusChange(s)}
                >
                  Passer à "{s}"
                </Button>
              ))}
            </div>
            <p className="text-gray-600 text-sm mt-2">
              Passée le {new Date(order.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tracking info */}
            {tracking && (
              <div className="p-3 rounded-md border bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Numéro de suivi</div>
                    <div className="font-medium">{tracking.tracking_number}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Transporteur</div>
                    <div className="font-medium">{tracking.carrier}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Livraison estimée</div>
                    <div className="font-medium">{tracking.estimated_delivery ? new Date(tracking.estimated_delivery).toLocaleDateString('fr-FR') : '-'}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleReorder}>Commander à nouveau</Button>
                    <a href={`/api/orders/${order.id}/invoice`} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" /> Facture
                      </Button>
                    </a>
                    {getTrackingExternalUrl() && (
                      <a href={getTrackingExternalUrl() as string} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm">Suivi transporteur</Button>
                      </a>
                    )}
                  </div>
                </div>
                {updates.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {updates.map((u, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full bg-jomiastore-primary" />
                        <div>
                          <div className="text-sm font-medium">{u.status}</div>
                          <div className="text-xs text-gray-600">{new Date(u.timestamp).toLocaleString('fr-FR')} {u.location ? `• ${u.location}` : ''}</div>
                          {u.notes && <div className="text-xs text-gray-700 mt-1">{u.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div>
              <h3 className="font-semibold mb-2">Produits</h3>
              <div className="space-y-3">
                {(order.order_items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <NextImage
                      src={item.product?.images?.[0] || "/placeholder.jpg"}
                      alt={item.product?.name || "Produit"}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product?.name}</h4>
                      <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {item.price * item.quantity} {order.currency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="font-semibold">Total:</span>
              <span className="text-lg font-bold">{order.total_amount} {order.currency}</span>
            </div>
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Adresse de livraison</h3>
              <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">
                {JSON.stringify(order.shipping_address, null, 2)}
              </pre>
            </div>
            {order.notes && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p>{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
