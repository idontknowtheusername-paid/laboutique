import { BaseService, ServiceResponse } from './base.service';

export type SettingGroup =
  | 'general'
  | 'appearance'
  | 'orders'
  | 'payments'
  | 'shipping'
  | 'security'
  | 'maintenance';

export interface SettingRecord {
  id: string;
  key: string;
  value: any;
  group: SettingGroup;
  updated_at: string;
}

export class SettingsService extends BaseService {
  static async getAll(): Promise<ServiceResponse<Record<string, any>>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('settings')
        .select('*');
      if (error) throw error;
      const map: Record<string, any> = {};
      (data || []).forEach((row: any) => {
        map[`${row.group}.${row.key}`] = row.value;
      });
      return this.createResponse(map);
    } catch (error) {
      return this.createResponse({}, this.handleError(error));
    }
  }

  static async getByGroup(group: SettingGroup): Promise<ServiceResponse<Record<string, any>>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('settings')
        .select('*')
        .eq('group', group);
      if (error) throw error;
      const map: Record<string, any> = {};
      (data || []).forEach((row: any) => {
        map[row.key] = row.value;
      });
      return this.createResponse(map);
    } catch (error) {
      return this.createResponse({}, this.handleError(error));
    }
  }

  static async upsert(group: SettingGroup, key: string, value: any): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await (this.getSupabaseClient() as any)
        .from('settings')
        .upsert({ group, key, value, updated_at: new Date().toISOString() }, { onConflict: 'group,key' });
      if (error) throw error;
      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  static async upsertMany(items: Array<{ group: SettingGroup; key: string; value: any }>): Promise<ServiceResponse<boolean>> {
    try {
      const rows = items.map((i) => ({ ...i, updated_at: new Date().toISOString() }));
      const { error } = await (this.getSupabaseClient() as any)
        .from('settings')
        .upsert(rows, { onConflict: 'group,key' });
      if (error) throw error;
      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }
}

