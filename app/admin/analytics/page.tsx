'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Eye, 
  MousePointer, 
  Clock,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Download
} from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [salesData, setSalesData] = useState<any[]>([]);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [conversionData, setConversionData] = useState<any[]>([]);
  const [deviceData, setDeviceData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simuler des données d'analytics
      const mockSalesData = [
        { date: '2024-01-01', revenue: 125000, orders: 15, customers: 12 },
        { date: '2024-01-02', revenue: 98000, orders: 12, customers: 10 },
        { date: '2024-01-03', revenue: 156000, orders: 18, customers: 15 },
        { date: '2024-01-04', revenue: 203000, orders: 22, customers: 18 },
        { date: '2024-01-05', revenue: 178000, orders: 20, customers: 16 },
        { date: '2024-01-06', revenue: 145000, orders: 17, customers: 14 },
        { date: '2024-01-07', revenue: 189000, orders: 21, customers: 17 }
      ];

      const mockTrafficData = [
        { date: '2024-01-01', visitors: 1250, pageviews: 3200, sessions: 1100 },
        { date: '2024-01-02', visitors: 980, pageviews: 2800, sessions: 850 },
        { date: '2024-01-03', visitors: 1560, pageviews: 4100, sessions: 1200 },
        { date: '2024-01-04', visitors: 2030, pageviews: 5200, sessions: 1500 },
        { date: '2024-01-05', visitors: 1780, pageviews: 4600, sessions: 1300 },
        { date: '2024-01-06', visitors: 1450, pageviews: 3800, sessions: 1100 },
        { date: '2024-01-07', visitors: 1890, pageviews: 4900, sessions: 1400 }
      ];

      const mockConversionData = [
        { source: 'Google', visitors: 2500, conversions: 125, rate: 5.0 },
        { source: 'Facebook', visitors: 1800, conversions: 72, rate: 4.0 },
        { source: 'Instagram', visitors: 1200, conversions: 48, rate: 4.0 },
        { source: 'Direct', visitors: 800, conversions: 40, rate: 5.0 },
        { source: 'Email', visitors: 600, conversions: 36, rate: 6.0 }
      ];

      const mockDeviceData = [
        { name: 'Mobile', value: 65, color: '#3B82F6' },
        { name: 'Desktop', value: 30, color: '#10B981' },
        { name: 'Tablet', value: 5, color: '#F59E0B' }
      ];

      const mockTopProducts = [
        { name: 'iPhone 15 Pro Max', sales: 45, revenue: 38250000 },
        { name: 'Samsung Galaxy S24', sales: 32, revenue: 24000000 },
        { name: 'MacBook Pro M3', sales: 18, revenue: 45000000 },
        { name: 'iPad Air', sales: 25, revenue: 12500000 },
        { name: 'AirPods Pro', sales: 67, revenue: 6700000 }
      ];

      setSalesData(mockSalesData);
      setTrafficData(mockTrafficData);
      setConversionData(mockConversionData);
      setDeviceData(mockDeviceData);
      setTopProducts(mockTopProducts);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setLoading(false);
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
          <p className="text-gray-600">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics avancées"
        subtitle="Tableaux de bord et métriques détaillées"
        actions={
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 derniers jours</SelectItem>
                <SelectItem value="30d">30 derniers jours</SelectItem>
                <SelectItem value="90d">90 derniers jours</SelectItem>
                <SelectItem value="1y">1 an</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        }
      />

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(1250000)}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8.2% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visiteurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,456</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15.3% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8%</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +0.3% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="traffic">Trafic</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des ventes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatPrice(Number(value))} />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trafic par appareil</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenus et commandes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenus" />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" name="Commandes" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nouveaux clients</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="customers" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visiteurs et pages vues</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="visitors" stroke="#3B82F6" name="Visiteurs" />
                    <Line type="monotone" dataKey="pageviews" stroke="#10B981" name="Pages vues" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sources de trafic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionData.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{source.source}</div>
                        <div className="text-sm text-gray-500">
                          {source.visitors.toLocaleString()} visiteurs
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{source.conversions} conversions</div>
                        <div className="text-sm text-gray-500">{source.rate}% taux</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-jomiastore-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sales} ventes</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatPrice(product.revenue)}</div>
                      <div className="text-sm text-gray-500">Revenus</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Pages vues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">45,230</div>
                <p className="text-sm text-gray-500">+8.5% ce mois</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="w-5 h-5" />
                  Taux de clic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2.4%</div>
                <p className="text-sm text-gray-500">+0.2% ce mois</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Temps moyen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">3m 24s</div>
                <p className="text-sm text-gray-500">+12s ce mois</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Funnel de conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="font-medium">Visiteurs</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <span className="font-bold">12,456</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="font-medium">Ajouts au panier</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <span className="font-bold">1,868</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <span className="font-medium">Commandes</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                    <span className="font-bold">1,247</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <span className="font-medium">Paiements</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                    </div>
                    <span className="font-bold">998</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}