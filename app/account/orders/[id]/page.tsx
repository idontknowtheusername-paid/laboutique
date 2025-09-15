 "use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OrdersService, Order } from "@/lib/services";
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

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
    // eslint-disable-next-line
  }, [params.id]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await OrdersService.getById(params.id);
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setError(response.error || "Commande introuvable");
      }
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement de la commande");
    } finally {
      setLoading(false);
    }
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
            <div>
              <h3 className="font-semibold mb-2">Produits</h3>
              <div className="space-y-3">
                {(order.order_items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={item.product?.images?.[0] || "/placeholder.jpg"}
                      alt={item.product?.name || "Produit"}
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
