import { BaseService, ServiceResponse } from './base.service';
import { isSupabaseConfigured } from '@/lib/supabase';

export interface AnalyticsMetrics {
  revenue: number;
  orders: number;
  customers: number;
  visitors: number;
  conversion_rate: number;
  average_order_value: number;
  revenue_growth: number;
  orders_growth: number;
  customers_growth: number;
  visitors_growth: number;
  conversion_growth: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  average_order_value: number;
}

export interface TrafficData {
  date: string;
  visitors: number;
  pageviews: number;
  sessions: number;
  bounce_rate: number;
  session_duration: number;
}

export interface ConversionData {
  source: string;
  visitors: number;
  conversions: number;
  rate: number;
  revenue: number;
}

export interface DeviceData {
  name: string;
  value: number;
  color: string;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  growth: number;
  category?: string;
}

export interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AnalyticsFilters {
  date_from?: string;
  date_to?: string;
  time_range?: '7d' | '30d' | '90d' | '1y';
  category?: string;
  product_id?: string;
}

export class AnalyticsService extends BaseService {
  /**
   * Récupérer les métriques principales
   */
  static async getMetrics(filters: AnalyticsFilters = {}): Promise<ServiceResponse<AnalyticsMetrics>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse({
          revenue: 0,
          orders: 0,
          customers: 0,
          visitors: 0,
          conversion_rate: 0,
          average_order_value: 0,
          revenue_growth: 0,
          orders_growth: 0,
          customers_growth: 0,
          visitors_growth: 0,
          conversion_growth: 0
        }, 'Supabase non configuré');
      }

      const { date_from, date_to, time_range = '30d' } = filters;
      
      // Calculer les dates
      const now = new Date();
      const endDate = date_to || now.toISOString().split('T')[0];
      const startDate = date_from || this.getStartDate(time_range);

      // Récupérer les données actuelles
      const { data: currentOrders, error: ordersError } = await this.getSupabaseClient()
        .from('orders')
        .select('id, total_amount, created_at, user_id')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .eq('status', 'completed');

      if (ordersError) throw ordersError;

      // Récupérer les données de la période précédente pour calculer la croissance
      const previousStartDate = this.getPreviousPeriodStartDate(startDate, time_range);
      const { data: previousOrders, error: prevOrdersError } = await this.getSupabaseClient()
        .from('orders')
        .select('id, total_amount, created_at, user_id')
        .gte('created_at', previousStartDate)
        .lt('created_at', startDate)
        .eq('status', 'completed');

      if (prevOrdersError) throw prevOrdersError;

      // Calculer les métriques actuelles
      const currentRevenue = currentOrders?.reduce((sum: any, order: any) => sum + (order.total_amount || 0), 0) || 0;
      const currentOrdersCount = currentOrders?.length || 0;
      const currentCustomers = new Set(currentOrders?.map((order: any) => order.user_id)).size || 0;
      const currentAverageOrderValue = currentOrdersCount > 0 ? currentRevenue / currentOrdersCount : 0;

      // Calculer les métriques précédentes
      const previousRevenue = previousOrders?.reduce((sum: any, order: any) => sum + (order.total_amount || 0), 0) || 0;
      const previousOrdersCount = previousOrders?.length || 0;
      const previousCustomers = new Set(previousOrders?.map((order: any) => order.user_id)).size || 0;

      // Simuler les visiteurs (dans un vrai projet, ceci viendrait d'un service d'analytics comme Google Analytics)
      const currentVisitors = Math.floor(currentCustomers * 8.5); // Ratio approximatif
      const previousVisitors = Math.floor(previousCustomers * 8.5);

      // Calculer les taux de croissance
      const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const ordersGrowth = previousOrdersCount > 0 ? ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100 : 0;
      const customersGrowth = previousCustomers > 0 ? ((currentCustomers - previousCustomers) / previousCustomers) * 100 : 0;
      const visitorsGrowth = previousVisitors > 0 ? ((currentVisitors - previousVisitors) / previousVisitors) * 100 : 0;

      // Calculer le taux de conversion
      const conversionRate = currentVisitors > 0 ? (currentOrdersCount / currentVisitors) * 100 : 0;
      const previousConversionRate = previousVisitors > 0 ? (previousOrdersCount / previousVisitors) * 100 : 0;
      const conversionGrowth = previousConversionRate > 0 ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100 : 0;

      return this.createResponse({
        revenue: currentRevenue,
        orders: currentOrdersCount,
        customers: currentCustomers,
        visitors: currentVisitors,
        conversion_rate: conversionRate,
        average_order_value: currentAverageOrderValue,
        revenue_growth: revenueGrowth,
        orders_growth: ordersGrowth,
        customers_growth: customersGrowth,
        visitors_growth: visitorsGrowth,
        conversion_growth: conversionGrowth
      });
    } catch (error) {
      return this.createResponse({
        revenue: 0,
        orders: 0,
        customers: 0,
        visitors: 0,
        conversion_rate: 0,
        average_order_value: 0,
        revenue_growth: 0,
        orders_growth: 0,
        customers_growth: 0,
        visitors_growth: 0,
        conversion_growth: 0
      }, this.handleError(error));
    }
  }

  /**
   * Récupérer les données de ventes par période
   */
  static async getSalesData(filters: AnalyticsFilters = {}): Promise<ServiceResponse<SalesData[]>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse([], 'Supabase non configuré');
      }

      const { date_from, date_to, time_range = '30d' } = filters;
      
      const now = new Date();
      const endDate = date_to || now.toISOString().split('T')[0];
      const startDate = date_from || this.getStartDate(time_range);

      // Récupérer les commandes groupées par jour
      const { data: orders, error } = await this.getSupabaseClient()
        .from('orders')
        .select('id, total_amount, created_at, user_id')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .eq('status', 'completed')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Grouper par jour
      const dailyData: { [key: string]: any } = {};
      orders?.forEach((order: any) => {
        const date = order.created_at.split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            revenue: 0,
            orders: 0,
            customers: new Set(),
            total_amount: 0
          };
        }
        dailyData[date].revenue += order.total_amount || 0;
        dailyData[date].orders += 1;
        dailyData[date].customers.add(order.user_id);
        dailyData[date].total_amount += order.total_amount || 0;
      });

      // Convertir en array et calculer l'AOV
      const salesData = Object.values(dailyData).map((day: any) => ({
        date: day.date,
        revenue: day.revenue,
        orders: day.orders,
        customers: day.customers.size,
        average_order_value: day.orders > 0 ? day.revenue / day.orders : 0
      }));

      return this.createResponse(salesData);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Récupérer les données de trafic
   */
  static async getTrafficData(filters: AnalyticsFilters = {}): Promise<ServiceResponse<TrafficData[]>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse([], 'Supabase non configuré');
      }

      const { date_from, date_to, time_range = '30d' } = filters;
      
      const now = new Date();
      const endDate = date_to || now.toISOString().split('T')[0];
      const startDate = date_from || this.getStartDate(time_range);

      // Récupérer les sessions (simulées - dans un vrai projet, ceci viendrait d'un service d'analytics)
      const { data: orders, error } = await this.getSupabaseClient()
        .from('orders')
        .select('created_at, user_id')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Simuler les données de trafic basées sur les commandes
      const dailyData: { [key: string]: any } = {};
      orders?.forEach((order: any) => {
        const date = order.created_at.split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            visitors: 0,
            pageviews: 0,
            sessions: 0,
            bounce_rate: 0,
            session_duration: 0
          };
        }
        dailyData[date].sessions += 1;
      });

      // Simuler les visiteurs et pages vues
      Object.keys(dailyData).forEach(date => {
        const dayData = dailyData[date];
        dayData.visitors = Math.floor(dayData.sessions * 1.2); // Ratio approximatif
        dayData.pageviews = Math.floor(dayData.visitors * 3.5); // Pages par visiteur
        dayData.bounce_rate = Math.random() * 0.3 + 0.4; // 40-70%
        dayData.session_duration = Math.random() * 300 + 120; // 2-7 minutes
      });

      const trafficData = Object.values(dailyData);
      return this.createResponse(trafficData);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Récupérer les données de conversion par source
   */
  static async getConversionData(filters: AnalyticsFilters = {}): Promise<ServiceResponse<ConversionData[]>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse([], 'Supabase non configuré');
      }

      const { date_from, date_to, time_range = '30d' } = filters;
      
      const now = new Date();
      const endDate = date_to || now.toISOString().split('T')[0];
      const startDate = date_from || this.getStartDate(time_range);

      // Récupérer les commandes avec leurs sources (simulées)
      const { data: orders, error } = await this.getSupabaseClient()
        .from('orders')
        .select('id, total_amount, created_at, user_id')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .eq('status', 'completed');

      if (error) throw error;

      // Simuler les sources de trafic
      const sources = ['Google', 'Apple', 'Instagram', 'Direct', 'Email', 'Referral'];
      const sourceData: { [key: string]: any } = {};

      sources.forEach(source => {
        const ordersFromSource = Math.floor((orders?.length || 0) * (Math.random() * 0.3 + 0.1));
        const visitors = Math.floor(ordersFromSource * (Math.random() * 5 + 10));
        const conversions = ordersFromSource;
        const revenue = orders?.slice(0, ordersFromSource).reduce((sum: any, order: any) => sum + (order.total_amount || 0), 0) || 0;

        sourceData[source] = {
          source,
          visitors,
          conversions,
          rate: visitors > 0 ? (conversions / visitors) * 100 : 0,
          revenue
        };
      });

      return this.createResponse(Object.values(sourceData));
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Récupérer les données d'appareils
   */
  static async getDeviceData(filters: AnalyticsFilters = {}): Promise<ServiceResponse<DeviceData[]>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse([], 'Supabase non configuré');
      }

      // Simuler les données d'appareils (dans un vrai projet, ceci viendrait d'un service d'analytics)
      const deviceData = [
        { name: 'Mobile', value: 65, color: '#3B82F6' },
        { name: 'Desktop', value: 30, color: '#10B981' },
        { name: 'Tablet', value: 5, color: '#F59E0B' }
      ];

      return this.createResponse(deviceData);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Récupérer les top produits
   */
  static async getTopProducts(filters: AnalyticsFilters = {}, limit: number = 10): Promise<ServiceResponse<TopProduct[]>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse([], 'Supabase non configuré');
      }

      const { date_from, date_to, time_range = '30d' } = filters;
      
      const now = new Date();
      const endDate = date_to || now.toISOString().split('T')[0];
      const startDate = date_from || this.getStartDate(time_range);

      // Récupérer les produits les plus vendus
      const { data: orderItems, error } = await this.getSupabaseClient()
        .from('order_items')
        .select(`
          product_id,
          quantity,
          price,
          products!inner(
            id,
            name,
            category_id,
            categories(name)
          )
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      // Grouper par produit
      const productData: { [key: string]: any } = {};
      orderItems?.forEach((item: any) => {
        const productId = item.product_id;
        if (!productData[productId]) {
          productData[productId] = {
            id: productId,
            name: item.products?.name || 'Produit inconnu',
            sales: 0,
            revenue: 0,
            category: item.products?.categories?.name
          };
        }
        productData[productId].sales += item.quantity || 0;
        productData[productId].revenue += (item.quantity || 0) * (item.price || 0);
      });

      // Convertir en array et trier par revenus
      const topProducts = Object.values(productData)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, limit)
        .map((product: any, index: number) => ({
          ...product,
          growth: Math.random() * 20 - 10 // Simulation de croissance
        }));

      return this.createResponse(topProducts);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Récupérer les données du funnel de conversion
   */
  static async getFunnelData(filters: AnalyticsFilters = {}): Promise<ServiceResponse<FunnelData[]>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse([], 'Supabase non configuré');
      }

      const { date_from, date_to, time_range = '30d' } = filters;
      
      const now = new Date();
      const endDate = date_to || now.toISOString().split('T')[0];
      const startDate = date_from || this.getStartDate(time_range);

      // Récupérer les métriques
      const metricsResponse = await this.getMetrics(filters);
      if (!metricsResponse.success || !metricsResponse.data) {
        return this.createResponse([]);
      }

      const metrics = metricsResponse.data;

      // Simuler le funnel basé sur les métriques réelles
      const visitors = metrics.visitors;
      const cartAdds = Math.floor(visitors * 0.15); // 15% ajoutent au panier
      const orders = metrics.orders;
      const payments = Math.floor(orders * 0.8); // 80% des commandes sont payées

      const funnelData = [
        {
          stage: 'Visiteurs',
          count: visitors,
          percentage: 100,
          color: '#3B82F6'
        },
        {
          stage: 'Ajouts au panier',
          count: cartAdds,
          percentage: (cartAdds / visitors) * 100,
          color: '#10B981'
        },
        {
          stage: 'Commandes',
          count: orders,
          percentage: (orders / visitors) * 100,
          color: '#F59E0B'
        },
        {
          stage: 'Paiements',
          count: payments,
          percentage: (payments / visitors) * 100,
          color: '#8B5CF6'
        }
      ];

      return this.createResponse(funnelData);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Exporter les données analytics
   */
  static async exportData(format: 'csv' | 'json', filters: AnalyticsFilters = {}): Promise<ServiceResponse<{ data: string; filename: string }>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse({ data: '', filename: '' }, 'Supabase non configuré');
      }

      // Récupérer toutes les données
      const [metricsResponse, salesResponse, trafficResponse, conversionResponse] = await Promise.all([
        this.getMetrics(filters),
        this.getSalesData(filters),
        this.getTrafficData(filters),
        this.getConversionData(filters)
      ]);

      const exportData = {
        metrics: metricsResponse.data,
        sales: salesResponse.data,
        traffic: trafficResponse.data,
        conversion: conversionResponse.data,
        exported_at: new Date().toISOString()
      };

      if (format === 'json') {
        const data = JSON.stringify(exportData, null, 2);
        const filename = `analytics-${new Date().toISOString().split('T')[0]}.json`;
        return this.createResponse({ data, filename });
      } else {
        // Format CSV simplifié
        const csvData = [
          'Metric,Value',
          `Revenue,${metricsResponse.data?.revenue || 0}`,
          `Orders,${metricsResponse.data?.orders || 0}`,
          `Customers,${metricsResponse.data?.customers || 0}`,
          `Visitors,${metricsResponse.data?.visitors || 0}`,
          `Conversion Rate,${metricsResponse.data?.conversion_rate || 0}%`
        ].join('\n');
        
        const filename = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
        return this.createResponse({ data: csvData, filename });
      }
    } catch (error) {
      return this.createResponse({ data: '', filename: '' }, this.handleError(error));
    }
  }

  /**
   * Utilitaires pour les dates
   */
  private static getStartDate(timeRange: string): string {
    const now = new Date();
    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    const daysToSubtract = days[timeRange as keyof typeof days] || 30;
    const startDate = new Date(now.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
    return startDate.toISOString().split('T')[0];
  }

  private static getPreviousPeriodStartDate(startDate: string, timeRange: string): string {
    const start = new Date(startDate);
    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    const daysToSubtract = days[timeRange as keyof typeof days] || 30;
    const previousStart = new Date(start.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
    return previousStart.toISOString().split('T')[0];
  }
}