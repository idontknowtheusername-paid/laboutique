'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Lazy load Recharts pour améliorer l'INP
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });

// Skeleton pour les charts
const ChartSkeleton = () => (
  <div className="min-h-[300px] flex items-center justify-center">
    <div className="w-full h-[280px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-gray-400">Chargement...</span>
    </div>
  </div>
);
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
            <Button variant="outline" onClick={loadAnalyticsData} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Rafraîchir
            </Button>
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        }
      />

      {/* Message d'aide si pas de données */}
      {metrics && metrics.visitors_all_time === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Aucune donnée de tracking pour le moment</h3>
              <p className="text-sm text-blue-700 mb-2">
                Le système de tracking est actif et prêt à collecter des données. Pour voir les statistiques :
              </p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Visitez votre site en tant que visiteur (ouvrez un nouvel onglet en navigation privée)</li>
                <li>Naviguez sur quelques pages (accueil, produits, etc.)</li>
                <li>Attendez 30 secondes puis revenez ici et cliquez sur "Rafraîchir"</li>
              </ul>
              <p className="text-xs text-blue-600 mt-2">
                💡 Astuce : Ouvrez la console du navigateur (F12) pour vérifier que les requêtes vers /api/analytics/track sont envoyées.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Métriques principales - REDESIGN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <div className="relative">
              <Users className="h-4 w-4 text-green-600" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics?.active_visitors || 0}
            </div>
            <p className="text-xs text-gray-500">
              En ce moment
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24 heures</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics?.visitors_24h || 0}
            </div>
            <p className="text-xs text-gray-500">
              Dernières 24h
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">7 jours</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {metrics?.visitors_7d || 0}
            </div>
            <p className="text-xs text-gray-500">
              Cette semaine
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">30 jours</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics?.visitors_30d || 0}
            </div>
            <p className="text-xs text-gray-500">
              Ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">
              {metrics?.visitors_all_time || 0}
            </div>
            <p className="text-xs text-gray-500">
              Depuis le début
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics ? `${metrics.conversion_rate.toFixed(1)}%` : '0%'}
            </div>
            <p className={`text-xs flex items-center ${
              metrics && metrics.conversion_growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {metrics ? `${metrics.conversion_growth >= 0 ? '+' : ''}${metrics.conversion_growth.toFixed(1)}%` : '0%'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="traffic">Trafic détaillé</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des visiteurs</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ChartSkeleton />}>
                  <div className="min-h-[300px]">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={trafficData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="visitors" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} name="Visiteurs" />
                        <Area type="monotone" dataKey="pageviews" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} name="Pages vues" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trafic par appareil</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ChartSkeleton />}>
                  <div className="min-h-[300px]">
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
                  </div>
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>



        <TabsContent value="traffic">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Visiteurs et pages vues</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<ChartSkeleton />}>
                    <div className="min-h-[300px]">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trafficData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="visitors" stroke="#8B5CF6" name="Visiteurs" strokeWidth={2} />
                          <Line type="monotone" dataKey="pageviews" stroke="#3B82F6" name="Pages vues" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Suspense>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sources de trafic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {conversionData.length > 0 ? (
                      conversionData.map((source, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{source.source}</div>
                            <div className="text-sm text-gray-500">
                              {source.visitors.toLocaleString()} visiteurs
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900 dark:text-white">{source.conversions} conversions</div>
                            <div className="text-sm text-green-600">{source.rate.toFixed(1)}% taux</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-8">
                        Aucune source de trafic détectée pour le moment.
                        <br />
                        Les données apparaîtront dès que des visiteurs accèdent au site.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pages les plus visitées */}
            <Card>
              <CardHeader>
                <CardTitle>Pages les plus visitées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.length > 0 ? (
                    topProducts.slice(0, 5).map((page, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium truncate max-w-xs">{page.name}</div>
                            <div className="text-sm text-gray-500">{page.sales} vues</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{page.sales}</div>
                          <div className="text-sm text-gray-500">visiteurs uniques</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      Aucune donnée de pages disponible pour le moment.
                      <br />
                      Les données apparaîtront dès que des visiteurs navigueront sur le site.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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
                  Panier moyen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {metrics ? formatPrice(metrics.average_order_value) : '0 FCFA'}
                </div>
                <p className="text-sm text-gray-500">Valeur moyenne par commande</p>
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