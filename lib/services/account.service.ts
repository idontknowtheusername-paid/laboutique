import { BaseService, ServiceResponse } from './base.service';

export interface PaymentMethod {
  id: string;
  user_id: string;
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
  holder_name?: string;
  is_default?: boolean;
  created_at?: string;
}

export interface AddressRecord {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  address_line: string;
  city?: string;
  country?: string;
  is_default?: boolean;
  created_at?: string;
}

export interface NotificationPrefs {
  id?: string;
  user_id: string;
  email_orders: boolean;
  email_promos: boolean;
  sms_orders: boolean;
  sms_promos: boolean;
  push_all: boolean;
  updated_at?: string;
}

export interface ReturnRequest {
  id: string;
  user_id: string;
  order_id: string;
  product_name?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  created_at?: string;
}

export class AccountService extends BaseService {
  // Payment Methods
  static async getPaymentMethods(userId: string): Promise<ServiceResponse<PaymentMethod[]>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return this.createResponse((data as PaymentMethod[]) || []);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  static async addPaymentMethod(userId: string, payload: Partial<PaymentMethod>): Promise<ServiceResponse<PaymentMethod | null>> {
    try {
      const { data, error } = await (this.getSupabaseClient() as any)
        .from('payment_methods')
        .insert([{ user_id: userId, ...payload }])
        .select()
        .single();
      if (error) throw error;
      return this.createResponse(data as PaymentMethod);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async deletePaymentMethod(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient().from('payment_methods').delete().eq('id', id);
      if (error) throw error;
      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  static async setDefaultPaymentMethod(userId: string, id: string): Promise<ServiceResponse<boolean>> {
    try {
      const client = this.getSupabaseClient() as any;
      await client.from('payment_methods').update({ is_default: false }).eq('user_id', userId);
      const { error } = await client.from('payment_methods').update({ is_default: true }).eq('id', id);
      if (error) throw error;
      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  // Addresses
  static async getAddresses(userId: string): Promise<ServiceResponse<AddressRecord[]>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return this.createResponse((data as AddressRecord[]) || []);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  static async addAddress(userId: string, payload: Partial<AddressRecord>): Promise<ServiceResponse<AddressRecord | null>> {
    try {
      const { data, error } = await (this.getSupabaseClient() as any)
        .from('addresses')
        .insert([{ user_id: userId, ...payload }])
        .select()
        .single();
      if (error) throw error;
      return this.createResponse(data as AddressRecord);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async updateAddress(id: string, payload: Partial<AddressRecord>): Promise<ServiceResponse<AddressRecord | null>> {
    try {
      const { data, error } = await (this.getSupabaseClient() as any)
        .from('addresses')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return this.createResponse(data as AddressRecord);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async deleteAddress(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient().from('addresses').delete().eq('id', id);
      if (error) throw error;
      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  static async setDefaultAddress(userId: string, id: string): Promise<ServiceResponse<boolean>> {
    try {
      const client = this.getSupabaseClient() as any;
      await client.from('addresses').update({ is_default: false }).eq('user_id', userId);
      const { error } = await client.from('addresses').update({ is_default: true }).eq('id', id);
      if (error) throw error;
      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  // Notification preferences
  static async getNotificationPrefs(userId: string): Promise<ServiceResponse<NotificationPrefs | null>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('notification_prefs')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      return this.createResponse(data as NotificationPrefs);
    } catch (error) {
      // If not found, return defaults
      return this.createResponse({ user_id: userId, email_orders: true, email_promos: false, sms_orders: false, sms_promos: false, push_all: true } as NotificationPrefs);
    }
  }

  static async upsertNotificationPrefs(userId: string, prefs: NotificationPrefs): Promise<ServiceResponse<NotificationPrefs | null>> {
    try {
      const payload = { ...prefs, user_id: userId, updated_at: new Date().toISOString() };
      const { data, error } = await (this.getSupabaseClient() as any)
        .from('notification_prefs')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();
      if (error) throw error;
      return this.createResponse(data as NotificationPrefs);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  // Returns
  static async getReturnRequests(userId: string): Promise<ServiceResponse<ReturnRequest[]>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('return_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return this.createResponse((data as ReturnRequest[]) || []);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  static async createReturnRequest(userId: string, payload: Partial<ReturnRequest>): Promise<ServiceResponse<ReturnRequest | null>> {
    try {
      const { data, error } = await (this.getSupabaseClient() as any)
        .from('return_requests')
        .insert([{ user_id: userId, status: 'pending', ...payload }])
        .select()
        .single();
      if (error) throw error;
      return this.createResponse(data as ReturnRequest);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }
}

