"use client";

import React from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Calendar, Package, CreditCard, Truck, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { OrdersService, Order, PaginatedResponse } from '@/lib/services';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function InvoicesPage() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      if (!user?.id) return;
      setLoading(true);
      const res: PaginatedResponse<Order> = await OrdersService.getByUser(user.id, { page, limit: 10 });
      setOrders(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setLoading(false);
    })();
  }, [user?.id, page]);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const formatPrice = (price: number) => new Intl.NumberFormat('fr-BJ', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(price);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'confirmed': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Livrée';
      case 'shipped': return 'Expédiée';
      case 'processing': return 'En préparation';
      case 'confirmed': return 'Confirmée';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  return (
    <ProtectedRoute>
      <div>
        <Breadcrumb items={[{ label: 'Mes factures' }]} />

        <div className="space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Mes factures</h1>
            <p className="text-sm text-gray-600 mt-1">Historique de vos commandes et factures</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">Aucune facture</h3>
                  <p className="text-sm text-gray-600 mb-4">Vous n'avez pas encore passé de commande</p>
                  <Link href="/">
                    <Button className="bg-jomionstore-primary hover:bg-orange-700">Découvrir nos produits</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      {/* Header */}
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-jomionstore-primary/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-jomionstore-primary" />
                            </div>
                            <div>
                              <div className="font-semibold">Facture #{order.order_number}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(order.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                            <div className="font-bold text-jomionstore-primary">{formatPrice(order.total_amount)}</div>
                            {expandedId === order.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedId === order.id && (
                        <div className="border-t bg-gray-50 p-4">
                          {/* Invoice Preview */}
                          <div className="bg-white border rounded-lg p-4 sm:p-6 mb-4">
                            {/* Invoice Header */}
                            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 pb-4 border-b">
                              <div>
                                <h3 className="text-lg font-bold text-jomionstore-primary">JOMIONSTORE</h3>
                                <p className="text-xs text-gray-500">E-commerce Bénin</p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold">FACTURE</div>
                                <div className="text-xs text-gray-600">N° {order.order_number}</div>
                                <div className="text-xs text-gray-600">{formatDate(order.created_at)}</div>
                              </div>
                            </div>

                            {/* Client Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                              <div>
                                <div className="text-xs font-semibold text-gray-500 mb-1">FACTURÉ À</div>
                                <div className="text-sm font-medium">
                                  {profile?.first_name} {profile?.last_name}
                                </div>
                                <div className="text-xs text-gray-600">{user?.email}</div>
                                {order.shipping_address && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    {typeof order.shipping_address === 'object'
                                      ? `${(order.shipping_address as any).address_line || ''}, ${(order.shipping_address as any).city || ''}`
                                      : order.shipping_address
                                    }
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-gray-500 mb-1">DÉTAILS</div>
                                <div className="text-xs text-gray-600 space-y-1">
                                  <div className="flex items-center gap-1">
                                    <CreditCard className="w-3 h-3" />
                                    Paiement: {order.payment_method || 'Mobile Money'}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Truck className="w-3 h-3" />
                                    Livraison: Standard
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Items */}
                            <div className="mb-4">
                              <div className="text-xs font-semibold text-gray-500 mb-2">ARTICLES</div>
                              <div className="border rounded overflow-hidden">
                                <table className="w-full text-xs">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="text-left p-2">Produit</th>
                                      <th className="text-center p-2 hidden sm:table-cell">Qté</th>
                                      <th className="text-right p-2">Prix</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(order.order_items || []).map((item, idx) => (
                                      <tr key={idx} className="border-t">
                                        <td className="p-2">
                                          <div className="font-medium line-clamp-1">{item.product?.name || 'Produit'}</div>
                                          <div className="text-gray-500 sm:hidden">Qté: {item.quantity}</div>
                                        </td>
                                        <td className="text-center p-2 hidden sm:table-cell">{item.quantity}</td>
                                        <td className="text-right p-2 font-medium">{formatPrice(item.price * item.quantity)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Totals */}
                            <div className="border-t pt-4">
                              <div className="flex justify-end">
                                <div className="w-full sm:w-48 space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Sous-total</span>
                                    <span>{formatPrice(order.total_amount)}</span>
                                  </div>
                                  {order.shipping_amount && order.shipping_amount > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Livraison</span>
                                      <span>{formatPrice(order.shipping_amount)}</span>
                                    </div>
                                  )}
                                  {order.discount_amount && order.discount_amount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                      <span>Réduction</span>
                                      <span>-{formatPrice(order.discount_amount)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between font-bold text-base pt-2 border-t">
                                    <span>Total</span>
                                    <span className="text-jomionstore-primary">{formatPrice(order.total_amount)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link href={`/account/orders/${order.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-2" /> Voir la commande
                          </Button>
                        </Link>
                        <a href={`/api/orders/${order.id}/invoice`} target="_blank" rel="noreferrer" className="flex-1">
                          <Button className="w-full bg-jomionstore-primary hover:bg-orange-700">
                            <Download className="w-4 h-4 mr-2" /> Télécharger PDF
                          </Button>
                        </a>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <span className="flex items-center px-3 text-sm">Page {page} / {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
