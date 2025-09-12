import { BaseService, ServiceResponse } from './base.service';

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  regions?: string[];
  base_cost: number;
  cost_per_kg: number;
  free_shipping_threshold?: number;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
}

export interface ShippingRate {
  zone_id: string;
  zone_name: string;
  cost: number;
  estimated_delivery: string;
  is_free: boolean;
}

export interface ShippingCalculation {
  total_weight: number;
  destination: string;
  available_rates: ShippingRate[];
  recommended_rate: ShippingRate;
}

export class ShippingService extends BaseService {
  /**
   * Calculer les frais de livraison
   */
  static async calculateShipping(data: {
    destination_country: string;
    destination_region?: string;
    total_weight: number;
    total_value: number;
    items: Array<{ weight: number; value: number }>;
  }): Promise<ServiceResponse<ShippingCalculation | null>> {
    try {
      // Récupérer les zones de livraison applicables
      const { data: zones } = await this.getSupabaseClient()
        .from('shipping_zones')
        .select('*')
        .contains('countries', [data.destination_country])
        .eq('is_active', true);

      if (!zones || zones.length === 0) {
        return this.createResponse(null, 'Livraison non disponible pour cette destination');
      }

      const availableRates: ShippingRate[] = [];

      for (const zone of zones as ShippingZone[]) {
        let cost = zone.base_cost + (data.total_weight * zone.cost_per_kg);
        let isFree = false;

        // Vérifier la livraison gratuite
        if (zone.free_shipping_threshold && data.total_value >= zone.free_shipping_threshold) {
          cost = 0;
          isFree = true;
        }

        const estimatedDelivery = `${zone.estimated_days_min}-${zone.estimated_days_max} jours`;

        availableRates.push({
          zone_id: zone.id,
          zone_name: zone.name,
          cost,
          estimated_delivery: estimatedDelivery,
          is_free: isFree
        });
      }

      // Recommander le tarif le moins cher
      const recommendedRate = availableRates.reduce((min, rate) => 
        rate.cost < min.cost ? rate : min
      );

      return this.createResponse({
        total_weight: data.total_weight,
        destination: data.destination_country,
        available_rates: availableRates,
        recommended_rate: recommendedRate
      });
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer les zones de livraison
   */
  static async getShippingZones(): Promise<ServiceResponse<ShippingZone[]>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('shipping_zones')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return this.createResponse((data as ShippingZone[]) || []);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Créer une zone de livraison
   */
  static async createShippingZone(data: Omit<ShippingZone, 'id'>): Promise<ServiceResponse<ShippingZone | null>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { data: zone, error } = await supabaseClient
        .from('shipping_zones')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return this.createResponse(zone as ShippingZone);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Vérifier la disponibilité de livraison
   */
  static async checkDeliveryAvailability(country: string, region?: string): Promise<ServiceResponse<{
    available: boolean;
    zones: ShippingZone[];
    restrictions?: string[];
  }>> {
    try {
      const { data: zones } = await this.getSupabaseClient()
        .from('shipping_zones')
        .select('*')
        .contains('countries', [country])
        .eq('is_active', true);

      const availableZones = (zones as ShippingZone[]) || [];
      
      return this.createResponse({
        available: availableZones.length > 0,
        zones: availableZones,
        restrictions: [] // TODO: Implémenter les restrictions
      });
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }
}