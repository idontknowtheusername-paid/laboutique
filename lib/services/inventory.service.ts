import { BaseService, ServiceResponse } from './base.service';
import { isSupabaseConfigured } from '@/lib/supabase';

export interface StockAlert {
  id: string;
  product_id: string;
  product_name: string;
  current_stock: number;
  min_stock: number;
  status: 'low' | 'out' | 'critical';
  created_at: string;
}

export interface InventoryStats {
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  critical_stock_count: number;
  total_value: number;
}

export class InventoryService extends BaseService {
  // Obtenir les alertes de stock
  static async getStockAlerts(): Promise<ServiceResponse<StockAlert[]>> {
    if (!isSupabaseConfigured()) {
      return this.createResponse([]);
    }

    try {
      const { data, error } = await this.getSupabaseClient()
        .from('products')
        .select(`
          id,
          name,
          quantity,
          min_quantity,
          price
        `)
        .or('quantity.lte.min_quantity,quantity.eq.0')
        .order('quantity', { ascending: true });

      if (error) throw error;

      const alerts: StockAlert[] = (data || []).map((product: any) => ({
        id: product.id,
        product_id: product.id,
        product_name: product.name,
        current_stock: product.quantity || 0,
        min_stock: product.min_quantity || 0,
        status: product.quantity === 0 ? 'out' : 
                product.quantity <= (product.min_quantity || 0) ? 'critical' : 'low',
        created_at: new Date().toISOString()
      }));

      return this.createResponse(alerts);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  // Obtenir les statistiques d'inventaire
  static async getInventoryStats(): Promise<ServiceResponse<InventoryStats>> {
    if (!isSupabaseConfigured()) {
      return this.createResponse({
        total_products: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
        critical_stock_count: 0,
        total_value: 0
      });
    }

    try {
      const { data: products, error } = await this.getSupabaseClient()
        .from('products')
        .select('id, quantity, min_quantity, price');

      if (error) throw error;

      const stats = (products || []).reduce((acc: any, product: any) => {
        acc.total_products++;
        acc.total_value += (product.price || 0) * (product.quantity || 0);
        
        if (product.quantity === 0) {
          acc.out_of_stock_count++;
        } else if (product.quantity <= (product.min_quantity || 0)) {
          acc.critical_stock_count++;
        } else if (product.quantity <= (product.min_quantity || 0) * 2) {
          acc.low_stock_count++;
        }
        
        return acc;
      }, {
        total_products: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
        critical_stock_count: 0,
        total_value: 0
      });

      return this.createResponse(stats);
    } catch (error) {
      return this.createResponse({
        total_products: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
        critical_stock_count: 0,
        total_value: 0
      }, this.handleError(error));
    }
  }

  // Mettre à jour le stock d'un produit
  static async updateStock(productId: string, newQuantity: number): Promise<ServiceResponse<boolean>> {
    if (!isSupabaseConfigured()) {
      return this.createResponse(true);
    }

    try {
      const { error } = await this.getSupabaseClient()
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', productId);

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }
}