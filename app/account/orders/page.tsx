"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionManager } from "@/hooks/useSessionManager";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  User,
  Eye,
  Star,
  RotateCcw,
  Truck,
  CheckCircle,
  XCircle,
  ShoppingBag,
} from "lucide-react";
import { OrdersService, Order, PaginatedResponse } from "@/lib/services";
import Link from "next/link";
import NextImage from "next/image";

export default function OrdersPage() {
  const { user } = useAuth();
  useSessionManager();

  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch orders
  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const pagination = { page, limit: 10 };
        // OrdersService.getByUser only takes userId and pagination
        let pag = { ...pagination };
        let res: PaginatedResponse<Order>;
        if (statusFilter) {
          // getAll allows filters, but getByUser only userId and pagination, so filter after fetch
          res = await OrdersService.getByUser(user.id, pag);
          res.data = res.data.filter((order) => order.status === statusFilter);
        } else {
          res = await OrdersService.getByUser(user.id, pag);
        }
        setOrders(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
      } catch (e) {
        setOrders([]);
        setTotalPages(1);
      }
    };
    fetchOrders();
  }, [user, statusFilter, page]);

  // Handlers
  const handleStatusFilter = (status: string | undefined) => {
    setStatusFilter(status);
    setPage(1);
  };

  // Utils
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const formatPrice = (price: number) => `${price.toFixed(2)} €`;
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "confirmed":
        return "Confirmée";
      case "processing":
        return "En préparation";
      case "shipped":
        return "Expédiée";
      case "delivered":
        return "Livrée";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-blue-200 text-blue-900";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ProtectedRoute>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Mon compte</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/account"
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <User className="w-4 h-4" />
                <span>Mon profil</span>
              </Link>
              <Link
                href="/account/orders"
                className="flex items-center space-x-3 p-2 rounded-lg bg-primary/5 text-primary"
              >
                <Package className="w-4 h-4" />
                <span>Mes commandes</span>
              </Link>
              <Link
                href="/account/wishlist"
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Ma wishlist</span>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Mes commandes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filtres de statut */}
              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter(undefined)}
                >
                  Toutes
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter("pending")}
                >
                  En attente
                </Button>
                <Button
                  variant={statusFilter === "confirmed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter("confirmed")}
                >
                  Confirmées
                </Button>
                <Button
                  variant={
                    statusFilter === "processing" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleStatusFilter("processing")}
                >
                  En préparation
                </Button>
                <Button
                  variant={statusFilter === "shipped" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter("shipped")}
                >
                  Expédiées
                </Button>
                <Button
                  variant={statusFilter === "delivered" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter("delivered")}
                >
                  Livrées
                </Button>
                <Button
                  variant={statusFilter === "cancelled" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter("cancelled")}
                >
                  Annulées
                </Button>
              </div>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune commande
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Vous n'avez pas encore passé de commande.
                  </p>
                  <Link href="/">
                    <Button>Découvrir nos produits</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <Card
                      key={order.id}
                      className="border-l-4 border-l-primary"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold">
                              Commande #{order.order_number}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Passée le {formatDate(order.created_at)}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Order Items */}
                          <div className="space-y-3">
                            {(order.order_items || []).map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                              >
                                <NextImage
                                  src={
                                    item.product?.images?.[0] ||
                                    "/placeholder.jpg"
                                  }
                                  alt={item.product?.name || "Produit"}
                                  width={64}
                                  height={64}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium">
                                    {item.product?.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Quantité: {item.quantity}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold">
                                    {formatPrice(item.price * item.quantity)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Total */}
                          <div className="flex justify-between items-center pt-4 border-t">
                            <span className="font-semibold">Total:</span>
                            <span className="text-lg font-bold">
                              {formatPrice(order.total_amount)}
                            </span>
                          </div>

                          {/* Order Actions */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex space-x-3">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                Voir les détails
                              </Button>
                              {order.status === "delivered" && (
                                <>
                                  <Button variant="outline" size="sm">
                                    <Star className="w-4 h-4 mr-2" />
                                    Noter
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Retourner
                                  </Button>
                                </>
                              )}
                              {order.status === "shipped" && (
                                <Button variant="outline" size="sm">
                                  <Truck className="w-4 h-4 mr-2" />
                                  Suivre
                                </Button>
                              )}
                            </div>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              Commander à nouveau
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Précédent
                  </Button>
                  <span className="px-2 py-1 text-sm">
                    Page {page} / {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs for different order statuses */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">Toutes</TabsTrigger>
                  <TabsTrigger value="delivered">Livrées</TabsTrigger>
                  <TabsTrigger value="shipped">Expédiées</TabsTrigger>
                  <TabsTrigger value="processing">En cours</TabsTrigger>
                  <TabsTrigger value="cancelled">Annulées</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      Toutes vos commandes sont affichées ci-dessus
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="delivered">
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Commandes livrées
                    </h3>
                    <p className="text-gray-600">
                      {
                        orders.filter((order) => order.status === "delivered")
                          .length
                      }{" "}
                      commande(s) livrée(s)
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="shipped">
                  <div className="text-center py-12">
                    <Truck className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Commandes expédiées
                    </h3>
                    <p className="text-gray-600">
                      {
                        orders.filter((order) => order.status === "shipped")
                          .length
                      }{" "}
                      commande(s) en cours de livraison
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="processing">
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Commandes en cours
                    </h3>
                    <p className="text-gray-600">
                      {
                        orders.filter((order) => order.status === "processing")
                          .length
                      }{" "}
                      commande(s) en préparation
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="cancelled">
                  <div className="text-center py-12">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Commandes annulées
                    </h3>
                    <p className="text-gray-600">
                      {
                        orders.filter((order) => order.status === "cancelled")
                          .length
                      }{" "}
                      commande(s) annulée(s)
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Continue Shopping */}
          <div className="text-center mt-12">
            <Link href="/">
              <Button variant="outline" size="lg">
                Continuer mes achats
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
