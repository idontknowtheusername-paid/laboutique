import { BaseService, ServiceResponse } from './base.service';
import { isSupabaseConfigured } from '@/lib/supabase';

export interface AnalyticsMetrics {
  active_visitors: number; // Visiteurs actuellement sur le site
  visitors_24h: number; // Visiteurs dans les dernières 24h
  visitors_7d: number; // Visiteurs dans les 7 derniers jours
  visitors_30d: number; // Visiteurs dans les 30 derniers jours
  visitors_all_time: number; // Visiteurs total ALL TIME (depuis le début)
  visitors: number; // Visiteurs total sur la période (pour compatibilité)
  conversion_rate: number;
  average_order_value: number;
  visitors_growth: number;
  conversion_growth: number;
  // Anciennes métriques (gardées pour compatibilité)
  revenue?: number;
  orders?: number;
  customers?: number;
  revenue_growth?: number;
  orders_growth?: number;
  customers_growth?: number;
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
   * Récupérer les métriques principales (AVEC VRAIES DONNÉES)
   */
  static async getMetrics(filters: AnalyticsFilters = {}): Promise<ServiceResponse<AnalyticsMetrics>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse({
          active_visitors: 0,
          visitors_24h: 0,
          visitors_7d: 0,
          visitors_30d: 0,
          visitors_all_time: 0,
          visitors: 0,
          conversion_rate: 0,
          average_order_value: 0,
          visitors_growth: 0,
          conversion_growth: 0
        }, 'Supabase non configuré');
      }

      const { date_from, date_to, time_range = '30d' } = filters;

      // 1. RÉCUPÉRER LES VISITEURS ACTIFS (depuis la vue)
      const { data: activeVisitorsData } = await this.getSupabaseClient()
        .from('v_active_visitors')
        .select('count')
        .single();

      const active_visitors = activeVisitorsData?.count || 0;

      // 2. RÉCUPÉRER LES VISITEURS 24H (depuis la vue)
      const { data: visitors24hData } = await this.getSupabaseClient()
        .from('v_visitors_24h')
        .select('count')
        .single();

      const visitors_24h = visitors24hData?.count || 0;

      // 3. RÉCUPÉRER LES VISITEURS 7J (depuis la vue)
      const { data: visitors7dData } = await this.getSupabaseClient()
        .from('v_visitors_7d')
        .select('count')
        .single();

      const visitors_7d = visitors7dData?.count || 0;

      // 4. RÉCUPÉRER LES VISITEURS 30J (depuis la vue)
      const { data: visitors30dData } = await this.getSupabaseClient()
        .from('v_visitors_30d')
        .select('count')
        .single();

      const visitors_30d = visitors30dData?.count || 0;

      // 5. RÉCUPÉRER LES VISITEURS ALL TIME (depuis la vue)
      const { data: visitorsAllTimeData } = await this.getSupabaseClient()
        .from('v_visitors_all_time')
        .select('count')
        .single();

      const visitors_all_time = visitorsAllTimeData?.count || 0;

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

      // 5. RÉCUPÉRER LES VISITEURS POUR LA PÉRIODE SÉLECTIONNÉE
      const { data: currentSessions } = await this.getSupabaseClient()
        .from('analytics_sessions')
        .select('visitor_id')
        .gte('started_at', startDate)
        .lte('started_at', endDate);

      const currentVisitors = new Set(currentSessions?.map((s: any) => s.visitor_id)).size || 0;

      // 6. RÉCUPÉRER LES VISITEURS DE LA PÉRIODE PRÉCÉDENTE
      const { data: previousSessions } = await this.getSupabaseClient()
        .from('analytics_sessions')
        .select('visitor_id')
        .gte('started_at', previousStartDate)
        .lt('started_at', startDate);

      const previousVisitors = new Set(previousSessions?.map((s: any) => s.visitor_id)).size || 0;

      // Calculer les taux de croissance
      const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const ordersGrowth = previousOrdersCount > 0 ? ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100 : 0;
      const customersGrowth = previousCustomers > 0 ? ((currentCustomers - previousCustomers) / previousCustomers) * 100 : 0;
      const visitorsGrowth = previousVisitors > 0 ? ((currentVisitors - previousVisitors) / previousVisitors) * 100 : 0;

      // Calculer le taux de conversion (visiteurs → commandes)
      const conversionRate = currentVisitors > 0 ? (currentOrdersCount / currentVisitors) * 100 : 0;
      const previousConversionRate = previousVisitors > 0 ? (previousOrdersCount / previousVisitors) * 100 : 0;
      const conversionGrowth = previousConversionRate > 0 ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100 : 0;

      return this.createResponse({
        active_visitors, // ✅ VRAIES DONNÉES depuis v_active_visitors
        visitors_24h, // ✅ VRAIES DONNÉES depuis v_visitors_24h
        visitors_7d, // ✅ VRAIES DONNÉES depuis v_visitors_7d
        visitors_30d, // ✅ VRAIES DONNÉES depuis v_visitors_30d
        visitors_all_time, // ✅ VRAIES DONNÉES depuis v_visitors_all_time (TOTAL)
        visitors: currentVisitors, // ✅ VRAIES DONNÉES depuis analytics_sessions (période)
        conversion_rate: conversionRate,
        average_order_value: currentAverageOrderValue,
        visitors_growth: visitorsGrowth,
        conversion_growth: conversionGrowth,
        // Anciennes métriques (gardées pour compatibilité)
        revenue: currentRevenue,
        orders: currentOrdersCount,
        customers: currentCustomers,
        revenue_growth: revenueGrowth,
        orders_growth: ordersGrowth,
        customers_growth: customersGrowth
      });
    } catch (error) {
      return this.createResponse({
        active_visitors: 0,
        visitors_24h: 0,
        visitors_7d: 0,
        visitors_30d: 0,
        visitors_all_time: 0,
        visitors: 0,
        conversion_rate: 0,
        average_order_value: 0,
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
   * Récupérer les données de trafic (AVEC VRAIES DONNÉES)
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

      // ✅ RÉCUPÉRER LES VRAIES DONNÉES depuis analytics_page_views et analytics_sessions
      const { data: pageViews, error: pvError } = await this.getSupabaseClient()
        .from('analytics_page_views')
        .select('viewed_at, visitor_id, time_on_page_seconds')
        .gte('viewed_at', startDate)
        .lte('viewed_at', endDate)
        .order('viewed_at', { ascending: true });

      if (pvError) throw pvError;

      const { data: sessions, error: sessError } = await this.getSupabaseClient()
        .from('analytics_sessions')
        .select('started_at, visitor_id, duration_seconds')
        .gte('started_at', startDate)
        .lte('started_at', endDate);

      if (sessError) throw sessError;

      // Grouper par jour
      const dailyData: { [key: string]: any } = {};

      // Traiter les pages vues
      pageViews?.forEach((pv: any) => {
        const date = pv.viewed_at.split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            visitors: new Set(),
            pageviews: 0,
            sessions: new Set(),
            total_session_duration: 0,
            session_count: 0
          };
        }
        dailyData[date].pageviews += 1;
        dailyData[date].visitors.add(pv.visitor_id);
      });

      // Traiter les sessions
      sessions?.forEach((session: any) => {
        const date = session.started_at.split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            visitors: new Set(),
            pageviews: 0,
            sessions: new Set(),
            total_session_duration: 0,
            session_count: 0
          };
        }
        dailyData[date].visitors.add(session.visitor_id);
        dailyData[date].sessions.add(session.visitor_id);
        dailyData[date].total_session_duration += session.duration_seconds || 0;
        dailyData[date].session_count += 1;
      });

      // Convertir en array et calculer les moyennes
      const trafficData = Object.values(dailyData).map((day: any) => ({
        date: day.date,
        visitors: day.visitors.size,
        pageviews: day.pageviews,
        sessions: day.sessions.size,
        bounce_rate: day.pageviews > 0 ? Math.max(0, 1 - (day.pageviews / day.sessions.size)) : 0,
        session_duration: day.session_count > 0 ? day.total_session_duration / day.session_count : 0
      }));

      return this.createResponse(trafficData);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Récupérer les données de conversion par source (AVEC VRAIES DONNÉES)
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

      // ✅ RÉCUPÉRER LES VRAIES SESSIONS avec leurs sources
      const { data: sessions, error: sessError } = await this.getSupabaseClient()
        .from('analytics_sessions')
        .select('visitor_id, utm_source, referrer_domain')
        .gte('started_at', startDate)
        .lte('started_at', endDate);

      if (sessError) {
        console.error('Erreur récupération sessions:', sessError);
        throw sessError;
      }

      // Si pas de sessions, retourner un tableau vide
      if (!sessions || sessions.length === 0) {
        console.log('Aucune session trouvée pour la période', { startDate, endDate });
        return this.createResponse([]);
      }

      // ✅ RÉCUPÉRER LES COMMANDES avec user_id
      const { data: orders, error: ordersError } = await this.getSupabaseClient()
        .from('orders')
        .select('id, total_amount, user_id, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .eq('status', 'completed');

      if (ordersError) throw ordersError;

      // Grouper les sessions par source
      const sourceData: { [key: string]: any } = {};

      sessions?.forEach((session: any) => {
        // Déterminer la source (priorité : utm_source > referrer_domain > direct)
        let source = 'Direct';
        if (session.utm_source) {
          source = session.utm_source;
        } else if (session.referrer_domain) {
          // Nettoyer le domaine referrer
          const domain = session.referrer_domain.replace('www.', '');
          if (domain.includes('google')) source = 'Google';
          else if (domain.includes('facebook')) source = 'Facebook';
          else if (domain.includes('instagram')) source = 'Instagram';
          else if (domain.includes('twitter') || domain.includes('x.com')) source = 'Twitter';
          else if (domain.includes('tiktok')) source = 'TikTok';
          else if (domain.includes('youtube')) source = 'YouTube';
          else source = 'Referral';
        }

        if (!sourceData[source]) {
          sourceData[source] = {
            source,
            visitors: new Set(),
            conversions: 0,
            revenue: 0
          };
        }

        sourceData[source].visitors.add(session.visitor_id);
      });

      // Compter les conversions par source (approximation basée sur la distribution)
      const totalOrders = orders?.length || 0;
      const totalVisitors = sessions?.length || 0;

      Object.keys(sourceData).forEach(source => {
        const sourceVisitors = sourceData[source].visitors.size;
        const sourceRatio = totalVisitors > 0 ? sourceVisitors / totalVisitors : 0;

        // Estimer les conversions proportionnellement
        const estimatedConversions = Math.round(totalOrders * sourceRatio);
        sourceData[source].conversions = estimatedConversions;

        // Calculer le revenu proportionnel
        const totalRevenue = orders?.reduce((sum: any, order: any) => sum + (order.total_amount || 0), 0) || 0;
        sourceData[source].revenue = totalRevenue * sourceRatio;
      });

      // Convertir en array et calculer les taux
      const conversionData = Object.values(sourceData).map((data: any) => ({
        source: data.source,
        visitors: data.visitors.size,
        conversions: data.conversions,
        rate: data.visitors.size > 0 ? (data.conversions / data.visitors.size) * 100 : 0,
        revenue: data.revenue
      }))
        .sort((a: any, b: any) => b.visitors - a.visitors); // Trier par nombre de visiteurs

      return this.createResponse(conversionData);
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
      const orders = metrics.orders || 0;
      const payments = Math.floor(orders * 0.8); // 80% des commandes sont payées

      const funnelData: FunnelData[] = [
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
          count: metrics.orders || 0,
          percentage: ((metrics.orders || 0) / visitors) * 100,
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
        // Format CSV complet avec toutes les métriques
        const metrics = metricsResponse.data;
        const traffic = trafficResponse.data || [];
        const sources = conversionResponse.data || [];

        const csvLines = [
          '=== MÉTRIQUES PRINCIPALES ===',
          'Métrique,Valeur',
          `Visiteurs actifs,${metrics?.active_visitors || 0}`,
          `Visiteurs 24h,${metrics?.visitors_24h || 0}`,
          `Visiteurs 7 jours,${metrics?.visitors_7d || 0}`,
          `Visiteurs 30 jours,${metrics?.visitors_30d || 0}`,
          `Visiteurs total,${metrics?.visitors || 0}`,
          `Taux de conversion,${metrics?.conversion_rate?.toFixed(2) || 0}%`,
          `Croissance visiteurs,${metrics?.visitors_growth?.toFixed(2) || 0}%`,
          '',
          '=== TRAFIC PAR JOUR ===',
          'Date,Visiteurs,Pages vues,Sessions,Durée session (s)',
          ...traffic.map((day: any) =>
            `${day.date},${day.visitors},${day.pageviews},${day.sessions},${Math.round(day.session_duration)}`
          ),
          '',
          '=== SOURCES DE TRAFIC ===',
          'Source,Visiteurs,Conversions,Taux (%)',
          ...sources.map((source: any) =>
            `${source.source},${source.visitors},${source.conversions},${source.rate?.toFixed(2)}`
          ),
          '',
          `Exporté le,${new Date().toLocaleString('fr-FR')}`
        ];
        
        const csvData = csvLines.join('\n');
        const filename = `jomionstore-analytics-${new Date().toISOString().split('T')[0]}.csv`;
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