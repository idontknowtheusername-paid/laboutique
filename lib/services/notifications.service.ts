import { BaseService, ServiceResponse } from './base.service';
import { isSupabaseConfigured } from '@/lib/supabase';

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error' | 'success';
  message: string;
  count: number;
  created_at: string;
  resolved: boolean;
}

export interface PendingTask {
  id: string;
  type: 'order' | 'product' | 'vendor' | 'payment';
  title: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  data?: any;
}

export class NotificationsService extends BaseService {
  // Obtenir toutes les alertes
  static async getAlerts(): Promise<ServiceResponse<Alert[]>> {
    if (!isSupabaseConfigured()) {
      return this.createResponse([]);
    }

    try {
      const { data, error } = await this.getSupabaseClient()
        .from('alerts')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  // Obtenir les tâches en attente
  static async getPendingTasks(): Promise<ServiceResponse<PendingTask[]>> {
    if (!isSupabaseConfigured()) {
      return this.createResponse([]);
    }

    try {
      const { data, error } = await this.getSupabaseClient()
        .from('pending_tasks')
        .select('*')
        .eq('completed', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  // Créer une alerte
  static async createAlert(alert: Omit<Alert, 'id' | 'created_at'>): Promise<ServiceResponse<Alert>> {
    if (!isSupabaseConfigured()) {
      return this.createResponse({} as Alert);
    }

    try {
      const { data, error } = await this.getSupabaseClient()
        .from('alerts')
        .insert([alert])
        .select()
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null as any, this.handleError(error));
    }
  }

  // Résoudre une alerte
  static async resolveAlert(alertId: string): Promise<ServiceResponse<boolean>> {
    if (!isSupabaseConfigured()) {
      return this.createResponse(true);
    }

    try {
      const { error } = await this.getSupabaseClient()
        .from('alerts')
        .update({ resolved: true })
        .eq('id', alertId);

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  // Compléter une tâche
  static async completeTask(taskId: string): Promise<ServiceResponse<boolean>> {
    if (!isSupabaseConfigured()) {
      return this.createResponse(true);
    }

    try {
      const { error } = await this.getSupabaseClient()
        .from('pending_tasks')
        .update({ completed: true })
        .eq('id', taskId);

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }
}