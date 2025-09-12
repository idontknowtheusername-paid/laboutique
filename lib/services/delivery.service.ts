import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';

export interface Delivery {
  id: string;
  order_id: string;
  tracking_number: string;
  carrier: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  pickup_address: any;
  delivery_address: any;
  estimated_delivery: string;
  actual_delivery?: string;
  delivery_notes?: string;
  signature_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryUpdate {
  id: string;
  delivery_id: string;
  status: Delivery['status'];
  location?: string;
  notes?: string;
  timestamp: string;
  created_at: string;
}

export interface Carrier {
  id: string;
  name: string;
  code: string;
  tracking_url_template: string;
  api_endpoint?: string;
  is_active: boolean;
}

export class DeliveryService extends BaseService {
  /**
   * Créer une livraison
   */
  static async createDelivery(data: {
    order_id: string;
    carrier: string;
    pickup_address: any;
    delivery_address: any;
    estimated_delivery: string;
  }): Promise<ServiceResponse<Delivery | null>> {
    try {
      const trackingNumber = this.generateTrackingNumber();
      
      const supabaseClient = this.getSupabaseClient() as any;
      const { data: delivery, error } = await supabaseClient
        .from('deliveries')
        .insert({
          order_id: data.order_id,
          tracking_number: trackingNumber,
          carrier: data.carrier,
          status: 'pending',
          pickup_address: data.pickup_address,
          delivery_address: data.delivery_address,
          estimated_delivery: data.estimated_delivery
        })
        .select()
        .single();

      if (error) throw error;
      return this.createResponse(delivery as Delivery);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Mettre à jour le statut de livraison
   */
  static async updateDeliveryStatus(
    deliveryId: string,
    status: Delivery['status'],
    location?: string,
    notes?: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'delivered') {
        updateData.actual_delivery = new Date().toISOString();
      }

      if (notes) {
        updateData.delivery_notes = notes;
      }

      const supabaseClient = this.getSupabaseClient() as any;
      const { error } = await supabaseClient
        .from('deliveries')
        .update(updateData)
        .eq('id', deliveryId);

      if (error) throw error;

      // Ajouter une mise à jour de suivi
      await this.addDeliveryUpdate(deliveryId, status, location, notes);

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Ajouter une mise à jour de suivi
   */
  static async addDeliveryUpdate(
    deliveryId: string,
    status: Delivery['status'],
    location?: string,
    notes?: string
  ): Promise<ServiceResponse<DeliveryUpdate | null>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { data, error } = await supabaseClient
        .from('delivery_updates')
        .insert({
          delivery_id: deliveryId,
          status,
          location,
          notes,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return this.createResponse(data as DeliveryUpdate);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Suivre une livraison
   */
  static async trackDelivery(trackingNumber: string): Promise<ServiceResponse<{
    delivery: Delivery;
    updates: DeliveryUpdate[];
  } | null>> {
    try {
      const { data: delivery, error } = await this.getSupabaseClient()
        .from('deliveries')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .single();

      if (error) throw error;

      const { data: updates } = await this.getSupabaseClient()
        .from('delivery_updates')
        .select('*')
        .eq('delivery_id', delivery.id)
        .order('timestamp', { ascending: true });

      return this.createResponse({
        delivery: delivery as Delivery,
        updates: (updates as DeliveryUpdate[]) || []
      });
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer les livraisons par statut
   */
  static async getDeliveriesByStatus(
    status: Delivery['status'],
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Delivery>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      const { data, error, count } = await this.getSupabaseClient()
        .from('deliveries')
        .select('*', { count: 'exact' })
        .eq('status', status)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const paginationInfo = this.calculatePagination(page, limit, total);

      return this.createPaginatedResponse((data as Delivery[]) || [], paginationInfo);
    } catch (error) {
      return this.createPaginatedResponse([], {
        page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false
      }, this.handleError(error));
    }
  }

  /**
   * Générer un numéro de suivi
   */
  private static generateTrackingNumber(): string {
    const prefix = 'TRK';
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Récupérer les transporteurs
   */
  static async getCarriers(): Promise<ServiceResponse<Carrier[]>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('carriers')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return this.createResponse((data as Carrier[]) || []);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Récupérer les statistiques de livraison
   */
  static async getDeliveryStats(): Promise<ServiceResponse<{
    total_deliveries: number;
    pending: number;
    in_transit: number;
    delivered: number;
    failed: number;
    average_delivery_time: number;
    on_time_rate: number;
  }>> {
    try {
      const { data: deliveries } = await this.getSupabaseClient()
        .from('deliveries')
        .select('*');

      const deliveriesData = deliveries as Delivery[] || [];
      
      const stats = {
        total_deliveries: deliveriesData.length,
        pending: deliveriesData.filter(d => d.status === 'pending').length,
        in_transit: deliveriesData.filter(d => ['picked_up', 'in_transit', 'out_for_delivery'].includes(d.status)).length,
        delivered: deliveriesData.filter(d => d.status === 'delivered').length,
        failed: deliveriesData.filter(d => d.status === 'failed').length,
        average_delivery_time: 0, // TODO: Calculer
        on_time_rate: 0 // TODO: Calculer
      };

      return this.createResponse(stats);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }
}