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

type SalesDatum = { month: string; revenue: number };
type CategoryDatum = { name: string; value: number; color: string };

export default function AdminDashboard() {
  const [salesData, setSalesData] = useState<SalesDatum[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDatum[]>([]);
  const [topVendors, setTopVendors] = useState<Vendor[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    (async () => {
      const vendorsRes = await VendorsService.getPopular(5);
      if (vendorsRes.success && vendorsRes.data) setTopVendors(vendorsRes.data);

      const ordersRes = await OrdersService.getRecent(10);
      if (ordersRes.success && ordersRes.data) setRecentOrders(ordersRes.data);

      const productsRes = await ProductsService.getNew(50);
      if (productsRes.success && productsRes.data) {
        const counts: Record<string, number> = {};
        productsRes.data.forEach((p: any) => {
          const key = p.category?.name || 'Autres';
          counts[key] = (counts[key] || 0) + 1;
        });
        const palette = ['#1E40AF', '#EA580C', '#7C2D12', '#059669', '#DC2626', '#0EA5E9'];
        const derived: CategoryDatum[] = Object.entries(counts).map(([name, value], i) => ({
          name,
          value: Number(value),
          color: palette[i % palette.length],
        }));
        setCategoryData(derived);
      }

      // Simple mocked sales series for the chart if none present
      setSalesData([
        { month: 'Jan', revenue: 12000000 },
        { month: 'Fév', revenue: 15000000 },
        { month: 'Mar', revenue: 18000000 },
        { month: 'Avr', revenue: 22000000 },
        { month: 'Mai', revenue: 26000000 },
        { month: 'Juin', revenue: 30000000 },
      ]);
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

  return (
    <div className="min-h-screen bg-beshop-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(58000000)}</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5% par rapport au mois dernier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes totales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,590</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.2% par rapport au mois dernier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,450</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +15.3% par rapport au mois dernier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendeurs actifs</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-green-600 flex items-center">+5.8% par rapport au mois dernier</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Évolution du chiffre d'affaires</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatPrice(Number(value))} />
                  <Area type="monotone" dataKey="revenue" stroke="#1E40AF" fill="#1E40AF" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Commandes récentes</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top vendeurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topVendors.map((vendor, index) => (
                  <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-beshop-primary rounded-full flex items-center justify-center">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

