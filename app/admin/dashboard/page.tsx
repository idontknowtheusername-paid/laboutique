'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Users, ShoppingCart, DollarSign, Package, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VendorsService, Vendor } from '@/lib/services/vendors.service';
import { ProductsService } from '@/lib/services/products.service';
import { OrdersService, Order } from '@/lib/services/orders.service';
import { StatsService, DashboardStats, SalesData, CategoryData } from '@/lib/services/stats.service';

type SalesDatum = { month: string; revenue: number };
type CategoryDatum = { name: string; value: number; color: string };

export default function AdminDashboard() {
  const [salesData, setSalesData] = useState<SalesDatum[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDatum[]>([]);
  const [topVendors, setTopVendors] = useState<Vendor[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      
      try {
        // Récupérer les statistiques du dashboard
        const statsRes = await StatsService.getDashboardStats();
        if (statsRes.success && statsRes.data) {
          setDashboardStats(statsRes.data);
        }

        // Récupérer les données de vente pour le graphique
        const salesRes = await StatsService.getSalesData(6);
        if (salesRes.success && salesRes.data) {
          setSalesData(salesRes.data);
        }

        // Récupérer les données par catégorie
        const categoryRes = await StatsService.getCategoryData();
        if (categoryRes.success && categoryRes.data) {
          setCategoryData(categoryRes.data);
        }

        // Récupérer les vendeurs populaires
        const vendorsRes = await VendorsService.getPopular(5);
        if (vendorsRes.success && vendorsRes.data) setTopVendors(vendorsRes.data);

        // Récupérer les commandes récentes
        const ordersRes = await OrdersService.getRecent(10);
        if (ordersRes.success && ordersRes.data) setRecentOrders(ordersRes.data);

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatPrice = (price: number) => new Intl.NumberFormat('fr-BJ', {
    style: 'currency', currency: 'XOF', minimumFractionDigits: 0,
  }).format(price);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-jomiastore-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jomiastore-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-jomiastore-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats ? formatPrice(dashboardStats.revenue.current) : formatPrice(0)}
              </div>
              <p className={`text-xs flex items-center ${
                dashboardStats && dashboardStats.revenue.growth_percentage >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {dashboardStats ? 
                  `${dashboardStats.revenue.growth_percentage >= 0 ? '+' : ''}${dashboardStats.revenue.growth_percentage}% par rapport au mois dernier` :
                  'Chargement...'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes totales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats ? dashboardStats.orders.current.toLocaleString() : '0'}
              </div>
              <p className={`text-xs flex items-center ${
                dashboardStats && dashboardStats.orders.growth_percentage >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {dashboardStats ? 
                  `${dashboardStats.orders.growth_percentage >= 0 ? '+' : ''}${dashboardStats.orders.growth_percentage}% par rapport au mois dernier` :
                  'Chargement...'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats ? dashboardStats.users.current.toLocaleString() : '0'}
              </div>
              <p className={`text-xs flex items-center ${
                dashboardStats && dashboardStats.users.growth_percentage >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {dashboardStats ? 
                  `${dashboardStats.users.growth_percentage >= 0 ? '+' : ''}${dashboardStats.users.growth_percentage}% par rapport au mois dernier` :
                  'Chargement...'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendeurs actifs</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats ? dashboardStats.vendors.current.toLocaleString() : '0'}
              </div>
              <p className={`text-xs flex items-center ${
                dashboardStats && dashboardStats.vendors.growth_percentage >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {dashboardStats ? 
                  `${dashboardStats.vendors.growth_percentage >= 0 ? '+' : ''}${dashboardStats.vendors.growth_percentage}% par rapport au mois dernier` :
                  'Chargement...'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Évolution du chiffre d'affaires</CardTitle>
            </CardHeader>
            <CardContent>
              {salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatPrice(Number(value))} />
                    <Area type="monotone" dataKey="revenue" stroke="#1E40AF" fill="#1E40AF" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  Aucune donnée de vente disponible
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  Aucune donnée de catégorie disponible
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Commandes récentes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-gray-600">{order.user?.first_name} {order.user?.last_name}</p>
                        <p className="text-xs text-gray-500">{order.order_items?.[0]?.vendor?.name || '—'}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold">{formatPrice(order.total_amount)}</p>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500">
                  Aucune commande récente
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top vendeurs</CardTitle>
            </CardHeader>
            <CardContent>
              {topVendors.length > 0 ? (
                <div className="space-y-4">
                  {topVendors.map((vendor, index) => (
                    <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-jomiastore-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{vendor.name}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{vendor.rating}</span>
                            <span>•</span>
                            <span>{vendor.total_orders} commandes</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(0)}</p>
                        <p className="text-sm text-gray-600">{vendor.commission_rate}% commission</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500">
                  Aucun vendeur disponible
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

