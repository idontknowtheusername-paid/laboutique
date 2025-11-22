import { BaseService, ServiceResponse } from './base.service';

export interface DashboardStats {
  revenue: {
    current: number;
    previous: number;
    growth_percentage: number;
    yearly: number;
    yearly_growth_percentage: number;
  };
  orders: {
    current: number;
    previous: number;
    growth_percentage: number;
    yearly: number;
    yearly_growth_percentage: number;
  };
  users: {
    current: number;
    previous: number;
    growth_percentage: number;
  };
  vendors: {
    current: number;
    previous: number;
    growth_percentage: number;
  };
}

export interface SalesData {
  month: string;
  revenue: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyStats {
  month: string;
  revenue: number;
  orders: number;
  users: number;
}

export class StatsService extends BaseService {
  /**
   * Récupérer les statistiques du dashboard
   */
  static async getDashboardStats(): Promise<ServiceResponse<DashboardStats>> {
    try {
      const currentMonth = new Date();
      const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const previousMonthStart = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1);
      const previousMonthEnd = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0);

      // Dates pour l'année en cours et précédente
      const currentYearStart = new Date(currentMonth.getFullYear(), 0, 1);
      const previousYearStart = new Date(currentMonth.getFullYear() - 1, 0, 1);
      const previousYearEnd = new Date(currentMonth.getFullYear() - 1, 11, 31);

      // Récupérer les commandes du mois actuel
      const { data: currentOrders, error: currentOrdersError } = await this.getSupabaseClient()
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', currentMonthStart.toISOString())
        .lt('created_at', new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1).toISOString());

      if (currentOrdersError) throw currentOrdersError;

      // Récupérer les commandes du mois précédent
      const { data: previousOrders, error: previousOrdersError } = await this.getSupabaseClient()
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', previousMonthStart.toISOString())
        .lte('created_at', previousMonthEnd.toISOString());

      if (previousOrdersError) throw previousOrdersError;

      // Récupérer les commandes de l'année en cours
      const { data: currentYearOrders, error: currentYearOrdersError } = await this.getSupabaseClient()
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', currentYearStart.toISOString());

      if (currentYearOrdersError) throw currentYearOrdersError;

      // Récupérer les commandes de l'année précédente
      const { data: previousYearOrders, error: previousYearOrdersError } = await this.getSupabaseClient()
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', previousYearStart.toISOString())
        .lte('created_at', previousYearEnd.toISOString());

      if (previousYearOrdersError) throw previousYearOrdersError;

      // Calculer le chiffre d'affaires mensuel
      const currentRevenue = (currentOrders || []).reduce((sum: number, order: any) => sum + order.total_amount, 0);
      const previousRevenue = (previousOrders || []).reduce((sum: number, order: any) => sum + order.total_amount, 0);
      const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      // Calculer le chiffre d'affaires annuel
      const currentYearRevenue = (currentYearOrders || []).reduce((sum: number, order: any) => sum + order.total_amount, 0);
      const previousYearRevenue = (previousYearOrders || []).reduce((sum: number, order: any) => sum + order.total_amount, 0);
      const yearlyRevenueGrowth = previousYearRevenue > 0 ? ((currentYearRevenue - previousYearRevenue) / previousYearRevenue) * 100 : 0;

      // Calculer le nombre de commandes mensuelles
      const currentOrdersCount = (currentOrders || []).length;
      const previousOrdersCount = (previousOrders || []).length;
      const ordersGrowth = previousOrdersCount > 0 ? ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100 : 0;

      // Calculer le nombre de commandes annuelles
      const currentYearOrdersCount = (currentYearOrders || []).length;
      const previousYearOrdersCount = (previousYearOrders || []).length;
      const yearlyOrdersGrowth = previousYearOrdersCount > 0 ? ((currentYearOrdersCount - previousYearOrdersCount) / previousYearOrdersCount) * 100 : 0;

      // Récupérer les utilisateurs actifs (créés ce mois)
      const { data: currentUsers, error: currentUsersError } = await this.getSupabaseClient()
        .from('profiles')
        .select('id, created_at')
        .gte('created_at', currentMonthStart.toISOString())
        .lt('created_at', new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1).toISOString());

      if (currentUsersError) throw currentUsersError;

      const { data: previousUsers, error: previousUsersError } = await this.getSupabaseClient()
        .from('profiles')
        .select('id, created_at')
        .gte('created_at', previousMonthStart.toISOString())
        .lte('created_at', previousMonthEnd.toISOString());

      if (previousUsersError) throw previousUsersError;

      // Calculer le nombre d'utilisateurs
      const currentUsersCount = (currentUsers || []).length;
      const previousUsersCount = (previousUsers || []).length;
      const usersGrowth = previousUsersCount > 0 ? ((currentUsersCount - previousUsersCount) / previousUsersCount) * 100 : 0;

      // Récupérer les vendeurs actifs
      const { data: currentVendors, error: currentVendorsError } = await this.getSupabaseClient()
        .from('vendors')
        .select('id, created_at, status')
        .eq('status', 'active')
        .gte('created_at', currentMonthStart.toISOString())
        .lt('created_at', new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1).toISOString());

      if (currentVendorsError) throw currentVendorsError;

      const { data: previousVendors, error: previousVendorsError } = await this.getSupabaseClient()
        .from('vendors')
        .select('id, created_at, status')
        .eq('status', 'active')
        .gte('created_at', previousMonthStart.toISOString())
        .lte('created_at', previousMonthEnd.toISOString());

      if (previousVendorsError) throw previousVendorsError;

      // Calculer le nombre de vendeurs
      const currentVendorsCount = (currentVendors || []).length;
      const previousVendorsCount = (previousVendors || []).length;
      const vendorsGrowth = previousVendorsCount > 0 ? ((currentVendorsCount - previousVendorsCount) / previousVendorsCount) * 100 : 0;

      const stats: DashboardStats = {
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          growth_percentage: Math.round(revenueGrowth * 10) / 10,
          yearly: currentYearRevenue,
          yearly_growth_percentage: Math.round(yearlyRevenueGrowth * 10) / 10
        },
        orders: {
          current: currentOrdersCount,
          previous: previousOrdersCount,
          growth_percentage: Math.round(ordersGrowth * 10) / 10,
          yearly: currentYearOrdersCount,
          yearly_growth_percentage: Math.round(yearlyOrdersGrowth * 10) / 10
        },
        users: {
          current: currentUsersCount,
          previous: previousUsersCount,
          growth_percentage: Math.round(usersGrowth * 10) / 10
        },
        vendors: {
          current: currentVendorsCount,
          previous: previousVendorsCount,
          growth_percentage: Math.round(vendorsGrowth * 10) / 10
        }
      };

      return this.createResponse(stats);
    } catch (error) {
      return this.createResponse({
        revenue: { current: 0, previous: 0, growth_percentage: 0, yearly: 0, yearly_growth_percentage: 0 },
        orders: { current: 0, previous: 0, growth_percentage: 0, yearly: 0, yearly_growth_percentage: 0 },
        users: { current: 0, previous: 0, growth_percentage: 0 },
        vendors: { current: 0, previous: 0, growth_percentage: 0 }
      }, this.handleError(error));
    }
  }

  /**
   * Récupérer les données de vente pour le graphique
   */
  static async getSalesData(months: number = 6): Promise<ServiceResponse<SalesData[]>> {
    try {
      const salesData: SalesData[] = [];
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const { data: orders, error } = await this.getSupabaseClient()
          .from('orders')
          .select('total_amount')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        if (error) throw error;

        const revenue = (orders || []).reduce((sum: number, order: any) => sum + order.total_amount, 0);

        salesData.push({
          month: monthNames[date.getMonth()],
          revenue
        });
      }

      return this.createResponse(salesData);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Récupérer les données par catégorie pour le graphique en secteurs
   */
  static async getCategoryData(): Promise<ServiceResponse<CategoryData[]>> {
    try {
      const { data: products, error } = await this.getSupabaseClient()
        .from('products')
        .select(`
          category_id,
          categories!inner(name)
        `)
        .eq('status', 'active');

      if (error) throw error;

      const categoryCounts: Record<string, number> = {};
      (products || []).forEach((product: any) => {
        const categoryName = product.categories?.name || 'Autres';
        categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
      });

      const palette = ['#1E40AF', '#EA580C', '#7C2D12', '#059669', '#DC2626', '#0EA5E9', '#7C3AED', '#DB2777'];
      const categoryData: CategoryData[] = Object.entries(categoryCounts).map(([name, value], index) => ({
        name,
        value,
        color: palette[index % palette.length]
      }));

      return this.createResponse(categoryData);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Récupérer les statistiques mensuelles détaillées
   */
  static async getMonthlyStats(months: number = 12): Promise<ServiceResponse<MonthlyStats[]>> {
    try {
      const monthlyStats: MonthlyStats[] = [];
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        // Récupérer les commandes du mois
        const { data: orders, error: ordersError } = await this.getSupabaseClient()
          .from('orders')
          .select('total_amount')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        if (ordersError) throw ordersError;

        // Récupérer les utilisateurs créés ce mois
        const { data: users, error: usersError } = await this.getSupabaseClient()
          .from('profiles')
          .select('id')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        if (usersError) throw usersError;

        const revenue = (orders || []).reduce((sum: number, order: any) => sum + order.total_amount, 0);
        const ordersCount = (orders || []).length;
        const usersCount = (users || []).length;

        monthlyStats.push({
          month: monthNames[date.getMonth()],
          revenue,
          orders: ordersCount,
          users: usersCount
        });
      }

      return this.createResponse(monthlyStats);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Récupérer le total des utilisateurs actifs (tous les utilisateurs)
   */
  static async getTotalActiveUsers(): Promise<ServiceResponse<number>> {
    try {
      const { count, error } = await this.getSupabaseClient()
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      return this.createResponse(count || 0);
    } catch (error) {
      return this.createResponse(0, this.handleError(error));
    }
  }

  /**
   * Récupérer le total des vendeurs actifs
   */
  static async getTotalActiveVendors(): Promise<ServiceResponse<number>> {
    try {
      const { count, error } = await this.getSupabaseClient()
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (error) throw error;

      return this.createResponse(count || 0);
    } catch (error) {
      return this.createResponse(0, this.handleError(error));
    }
  }

  /**
   * Récupérer le total des commandes
   */
  static async getTotalOrders(): Promise<ServiceResponse<number>> {
    try {
      const { count, error } = await this.getSupabaseClient()
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      return this.createResponse(count || 0);
    } catch (error) {
      return this.createResponse(0, this.handleError(error));
    }
  }

  /**
   * Récupérer le chiffre d'affaires total
   */
  static async getTotalRevenue(): Promise<ServiceResponse<number>> {
    try {
      const { data: orders, error } = await this.getSupabaseClient()
        .from('orders')
        .select('total_amount');

      if (error) throw error;

      const totalRevenue = (orders || []).reduce((sum: number, order: any) => sum + order.total_amount, 0);

      return this.createResponse(totalRevenue);
    } catch (error) {
      return this.createResponse(0, this.handleError(error));
    }
  }
}