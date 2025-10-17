'use client';

import React from 'react';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
// Import refreshUserStats from AuthContext
import { refreshUserStats } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { useSessionManager } from "@/hooks/useSessionManager";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard,
  MapPin,
  LogOut,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { OrdersService, Order, ProductsService, Product } from '@/lib/services';

export default function AccountPage() {
  const {
    user,
    profile,
    userStats,
    signOut,
    loading,
    error,
    refreshProfile,
    statsLoading,
  } = useAuth();

  // Initialize session manager for this protected page
  useSessionManager({
    autoRefresh: true,
    redirectOnExpiry: true,
  });

  const [refreshing, setRefreshing] = React.useState(false);
  const [recentOrders, setRecentOrders] = React.useState<Order[]>([]);
  const [salesSeries, setSalesSeries] = React.useState<Array<{ date: string; amount: number }>>([]);
  const [statusSeries, setStatusSeries] = React.useState<Array<{ name: string; value: number }>>([]);
  const [recommendations, setRecommendations] = React.useState<Product[]>([]);
  const pieColors = ['#1E40AF', '#059669', '#EA580C', '#6B7280', '#DC2626'];

  const handleSignOut = async () => {
    await signOut();
  };

  const handleRefreshProfile = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshProfile(), refreshUserStats()]);
    } finally {
      setRefreshing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  React.useEffect(() => {
    (async () => {
      try {
        if (!user?.id) return;
        // Load recent orders for charts and activity
        const res = await OrdersService.getByUser(user.id, { page: 1, limit: 20 });
        const orders = (res?.data as Order[]) || [];
        setRecentOrders(orders);

        // Build sales time series (by day)
        const map: Record<string, number> = {};
        orders.forEach(o => {
          const d = new Date(o.created_at);
          const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toLocaleDateString('fr-FR');
          map[key] = (map[key] || 0) + (o.total_amount || 0);
        });
        const series = Object.entries(map)
          .sort((a, b) => new Date(a[0] as any).getTime() - new Date(b[0] as any).getTime())
          .map(([date, amount]) => ({ date, amount }));
        setSalesSeries(series);

        // Build status distribution
        const statusMap: Record<string, number> = {};
        orders.forEach(o => {
          statusMap[o.status] = (statusMap[o.status] || 0) + 1;
        });
        const statuses = ['pending','confirmed','processing','shipped','delivered','cancelled'];
        const pie = statuses
          .filter(s => statusMap[s])
          .map(s => ({ name: s, value: statusMap[s] }));
        setStatusSeries(pie);

        // Load recommendations (new products)
        const rec = await ProductsService.getNew(8);
        if (rec.success && rec.data) setRecommendations(rec.data);
      } catch (e) {
        // silent fail for dashboard cosmetics
      }
    })();
  }, [user?.id]);

  const menuItems = [
    {
      icon: Package,
      title: "Mes commandes",
      description: "Suivez vos commandes et historique",
      href: "/account/orders",
      badge: userStats?.totalOrders || 0,
    },
    {
      icon: Heart,
      title: "Ma liste de souhaits",
      description: "Produits sauvegardés",
      href: "/account/wishlist",
      badge: userStats?.wishlistItems || 0,
    },
    {
      icon: CreditCard,
      title: "Moyens de paiement",
      description: "Gérez vos cartes et comptes",
      href: "/account/payment-methods",
    },
    {
      icon: MapPin,
      title: "Adresses",
      description: "Livraison et facturation",
      href: "/account/addresses",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Préférences de communication",
      href: "/account/notifications",
    },
    {
      icon: Settings,
      title: "Paramètres",
      description: "Compte et confidentialité",
      href: "/account/settings",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-jomionstore-primary" />
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} redirectTo="/auth/login">
      <div>
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: 'Mon compte' }]} />

          {error && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded px-4 py-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{error.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-jomionstore-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    {profile?.avatar_url ? (
                      <NextImage
                        src={profile.avatar_url}
                        alt="Avatar"
                        width={80}
                        height={80}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <CardTitle className="text-xl">
                    {profile?.first_name && profile?.last_name
                      ? `${profile.first_name} ${profile.last_name}`
                      : user?.email?.split("@")[0] || "Utilisateur"}
                  </CardTitle>
                  <p className="text-gray-600">{user?.email}</p>
                  <Badge variant="outline" className="w-fit mx-auto mt-2">
                    Membre depuis{" "}
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString(
                          "fr-FR",
                          { month: "long", year: "numeric" }
                        )
                      : "Récemment"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={handleRefreshProfile}
                    disabled={refreshing || statsLoading}
                    title="Rafraîchir le profil"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        refreshing || statsLoading ? "animate-spin" : ""
                      }`}
                    />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {statsLoading || refreshing ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-jomionstore-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-jomionstore-primary">
                            {userStats?.totalOrders || 0}
                          </div>
                          <div className="text-sm text-gray-600">Commandes</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-jomionstore-primary">
                            {userStats?.reviewsCount || 0}
                          </div>
                          <div className="text-sm text-gray-600">
                            Avis donnés
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {formatPrice(userStats?.totalSpent || 0)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total dépensé
                        </div>
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/account/profile">
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier le profil
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Se déconnecter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Menu Items */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <Link key={index} href={item.href}>
                      <Card className="hover-lift transition-all duration-200 cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-jomionstore-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <IconComponent className="w-6 h-6 text-jomionstore-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900">
                                  {item.title}
                                </h3>
                                {item.badge && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-lg">Actions rapides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/order-tracking">
                      <Button
                        variant="outline"
                        className="w-full h-16 flex-col"
                      >
                        <Package className="w-5 h-5 mb-2" />
                        Suivre une commande
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button
                        variant="outline"
                        className="w-full h-16 flex-col"
                      >
                        <Shield className="w-5 h-5 mb-2" />
                        Support client
                      </Button>
                    </Link>
                    <Link href="/help">
                      <Button
                        variant="outline"
                        className="w-full h-16 flex-col"
                      >
                        <Settings className="w-5 h-5 mb-2" />
                        Centre d'aide
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-600">Dépenses totales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPrice(userStats?.totalSpent || 0)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-600">Commandes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats?.totalOrders || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-600">Avis donnés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats?.reviewsCount || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-600">Wishlist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats?.wishlistItems || 0}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Évolution des dépenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={salesSeries}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="amount" stroke="#1E40AF" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Statuts de commandes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {statusSeries.length === 0 ? (
                      <div className="text-sm text-gray-500">Aucune donnée</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie data={statusSeries} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                            {statusSeries.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Activity Timeline */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Activité récente</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentOrders.length === 0 ? (
                    <div className="text-sm text-gray-500">Aucune activité récente</div>
                  ) : (
                    <div className="space-y-3">
                      {recentOrders.slice(0, 6).map(o => (
                        <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <div className="font-medium">Commande #{o.order_number}</div>
                            <div className="text-xs text-gray-600">{new Date(o.created_at).toLocaleString('fr-FR')}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className="bg-gray-100 text-gray-800">{o.status}</Badge>
                            <div className="font-semibold">{formatPrice(o.total_amount)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recommandations pour vous</CardTitle>
                </CardHeader>
                <CardContent>
                  {recommendations.length === 0 ? (
                    <div className="text-sm text-gray-500">Aucune recommandation pour le moment</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {recommendations.map((p) => (
                        <Link key={p.id} href={`/product/${p.slug}`} className="group">
                          <div className="border rounded-lg overflow-hidden">
                            <div className="relative w-full h-36 bg-gray-50">
                              <NextImage src={p.images?.[0] || '/placeholder-product.jpg'} alt={p.name} fill className="object-cover" sizes="(min-width: 768px) 25vw, 50vw" />
                            </div>
                            <div className="p-3">
                              <div className="text-sm font-medium line-clamp-2 group-hover:text-jomionstore-primary">{p.name}</div>
                              <div className="text-sm text-gray-700 mt-1">{formatPrice(p.price)}</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
      </div>
    </ProtectedRoute>
  );
}


