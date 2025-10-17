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
  Download,
  RefreshCw
} from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { AnalyticsService, AnalyticsMetrics, SalesData, TrafficData, ConversionData, DeviceData, TopProduct, FunnelData } from '@/lib/services/analytics.service';
import { useToast } from '@/components/admin/Toast';

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [conversionData, setConversionData] = useState<ConversionData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const { success, error } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const filters = { time_range: timeRange as any };
      
      // Charger toutes les données en parallèle
      const [
        metricsResponse,
        salesResponse,
        trafficResponse,
        conversionResponse,
        deviceResponse,
        productsResponse,
        funnelResponse
      ] = await Promise.all([
        AnalyticsService.getMetrics(filters),
        AnalyticsService.getSalesData(filters),
        AnalyticsService.getTrafficData(filters),
        AnalyticsService.getConversionData(filters),
        AnalyticsService.getDeviceData(filters),
        AnalyticsService.getTopProducts(filters, 10),
        AnalyticsService.getFunnelData(filters)
      ]);

      if (metricsResponse.success && metricsResponse.data) {
        setMetrics(metricsResponse.data);
      }

      if (salesResponse.success && salesResponse.data) {
        setSalesData(salesResponse.data);
      }

      if (trafficResponse.success && trafficResponse.data) {
        setTrafficData(trafficResponse.data);
      }

      if (conversionResponse.success && conversionResponse.data) {
        setConversionData(conversionResponse.data);
      }

      if (deviceResponse.success && deviceResponse.data) {
        setDeviceData(deviceResponse.data);
      }

      if (productsResponse.success && productsResponse.data) {
        setTopProducts(productsResponse.data);
      }

      if (funnelResponse.success && funnelResponse.data) {
        setFunnelData(funnelResponse.data);
      }

      success('Données chargées', 'Les analytics ont été mises à jour avec succès');
    } catch (err) {
      console.error('Erreur lors du chargement des analytics:', err);
      error('Erreur de chargement', 'Impossible de charger les données analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const result = await AnalyticsService.exportData(format, { time_range: timeRange as any });
      if (result.success && result.data) {
        const blob = new Blob([result.data.data], { 
          type: format === 'json' ? 'application/json' : 'text/csv' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.data.filename;
        a.click();
        URL.revokeObjectURL(url);
        success('Export réussi', `Le fichier ${result.data.filename} a été téléchargé`);
      } else {
        error('Erreur d\'export', result.error || 'Impossible d\'exporter les données');
      }
    } catch (err) {
      error('Erreur d\'export', 'Une erreur est survenue lors de l\'export');
    }
  };

  // Test de connexion à la base de données
  const testDatabaseConnection = async () => {
    try {
      const result = await AnalyticsService.getMetrics({ time_range: '7d' });
      if (result.success) {
        success('Connexion réussie', 'La base de données est accessible');
      } else {
        error('Erreur de connexion', result.error || 'Impossible de se connecter à la base');
      }
    } catch (err) {
      error('Erreur de connexion', 'Impossible de se connecter à la base de données');
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
            <Button variant="outline" onClick={testDatabaseConnection}>
              🔍 Test DB
            </Button>
            <Button variant="outline" onClick={loadAnalyticsData} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Rafraîchir
            </Button>
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
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('json')}>
              <Download className="w-4 h-4 mr-2" />
              JSON
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
            <div className="text-2xl font-bold">
              {metrics ? formatPrice(metrics.revenue) : '0 FCFA'}
            </div>
            <p className={`text-xs flex items-center ${
              metrics && metrics.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {metrics ? `${metrics.revenue_growth >= 0 ? '+' : ''}${metrics.revenue_growth.toFixed(1)}%` : '0%'} par rapport à la période précédente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.orders || 0}</div>
            <p className={`text-xs flex items-center ${
              metrics && metrics.orders_growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {metrics ? `${metrics.orders_growth >= 0 ? '+' : ''}${metrics.orders_growth.toFixed(1)}%` : '0%'} par rapport à la période précédente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visiteurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.visitors || 0}</div>
            <p className={`text-xs flex items-center ${
              metrics && metrics.visitors_growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {metrics ? `${metrics.visitors_growth >= 0 ? '+' : ''}${metrics.visitors_growth.toFixed(1)}%` : '0%'} par rapport à la période précédente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics ? `${metrics.conversion_rate.toFixed(1)}%` : '0%'}</div>
            <p className={`text-xs flex items-center ${
              metrics && metrics.conversion_growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {metrics ? `${metrics.conversion_growth >= 0 ? '+' : ''}${metrics.conversion_growth.toFixed(1)}%` : '0%'} par rapport à la période précédente
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
                      <div className="w-8 h-8 bg-jomionstore-primary rounded-full flex items-center justify-center">
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
                <div className="text-3xl font-bold">
                  {trafficData.length > 0 
                    ? trafficData.reduce((sum, day) => sum + day.pageviews, 0).toLocaleString()
                    : '0'
                  }
                </div>
                <p className="text-sm text-gray-500">Total sur la période</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="w-5 h-5" />
                  Taux de conversion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {metrics ? `${metrics.conversion_rate.toFixed(1)}%` : '0%'}
                </div>
                <p className="text-sm text-gray-500">Visiteurs vers commandes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  AOV moyen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {metrics ? formatPrice(metrics.average_order_value) : '0 FCFA'}
                </div>
                <p className="text-sm text-gray-500">Panier moyen</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Funnel de conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.length > 0 ? (
                  funnelData.map((stage, index) => (
                    <div key={stage.stage} className={`flex items-center justify-between p-4 rounded-lg`} 
                         style={{ backgroundColor: `${stage.color}15` }}>
                      <span className="font-medium">{stage.stage}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${stage.percentage}%`,
                              backgroundColor: stage.color
                            }}
                          ></div>
                        </div>
                        <span className="font-bold">{stage.count.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">({stage.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Aucune donnée de funnel disponible</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}