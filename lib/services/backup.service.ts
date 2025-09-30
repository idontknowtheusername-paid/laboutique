import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';
import { isSupabaseConfigured } from '@/lib/supabase';

export interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'database' | 'files';
  size: number;
  status: 'completed' | 'running' | 'failed' | 'scheduled';
  created_at: string;
  updated_at: string;
  duration?: number;
  location: 'local' | 'cloud' | 'external';
  description?: string;
  tables_count?: number;
  records_count?: number;
  compression_ratio?: number;
  encryption_enabled: boolean;
  checksum?: string;
  // Relations
  created_by?: string;
  created_by_user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface BackupSettings {
  id: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  retention_days: number;
  compression_enabled: boolean;
  encryption_enabled: boolean;
  location: 'local' | 'cloud' | 'external';
  auto_cleanup: boolean;
  notification_email?: string;
  created_at: string;
  updated_at: string;
}

export interface BackupStats {
  total_backups: number;
  total_size: number;
  successful_backups: number;
  failed_backups: number;
  success_rate: number;
  last_backup_date?: string;
  next_scheduled_backup?: string;
  storage_used: number;
  storage_available: number;
  storage_percentage: number;
}

export interface RestoreRequest {
  backup_id: string;
  restore_type: 'full' | 'partial';
  tables_to_restore?: string[];
  confirm_restore: boolean;
}

export interface BackupFilters {
  status?: 'completed' | 'running' | 'failed' | 'scheduled';
  type?: 'full' | 'incremental' | 'database' | 'files';
  location?: 'local' | 'cloud' | 'external';
  date_from?: string;
  date_to?: string;
}

export class BackupService extends BaseService {
  /**
   * Récupérer tous les backups avec pagination et filtres
   */
  static async getAll(
    filters: BackupFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Backup>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createPaginatedResponse([], { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false }, 'Supabase non configuré');
      }

      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = this.getSupabaseClient()
        .from('backups')
        .select(`
          id,
          name,
          type,
          size,
          status,
          created_at,
          updated_at,
          duration,
          location,
          description,
          tables_count,
          records_count,
          compression_ratio,
          encryption_enabled,
          checksum,
          created_by
        `, { count: 'exact' });

      // Appliquer les filtres
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.location) {
        query = query.eq('location', filters.location);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      // Trier par date de création
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const paginationInfo = this.calculatePagination(page, limit, total);

      return this.createPaginatedResponse(data || [], paginationInfo);
    } catch (error) {
      return this.createPaginatedResponse([], {
        page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false
      }, this.handleError(error));
    }
  }

  /**
   * Récupérer un backup par ID
   */
  static async getById(id: string): Promise<ServiceResponse<Backup | null>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(null, 'Supabase non configuré');
      }

      const { data, error } = await this.getSupabaseClient()
        .from('backups')
        .select(`
          id,
          name,
          type,
          size,
          status,
          created_at,
          updated_at,
          duration,
          location,
          description,
          tables_count,
          records_count,
          compression_ratio,
          encryption_enabled,
          checksum,
          created_by
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Créer un nouveau backup
   */
  static async createBackup(
    type: 'full' | 'incremental' | 'database' | 'files',
    description?: string
  ): Promise<ServiceResponse<Backup | null>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(null, 'Supabase non configuré');
      }

      const backupName = `backup_${new Date().toISOString().split('T')[0]}_${type}_${Date.now()}`;
      
      const { data, error } = await this.getSupabaseClient()
        .from('backups')
        .insert([{
          name: backupName,
          type,
          size: 0,
          status: 'running',
          location: 'cloud', // Par défaut
          description,
          encryption_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          id,
          name,
          type,
          size,
          status,
          created_at,
          updated_at,
          duration,
          location,
          description,
          tables_count,
          records_count,
          compression_ratio,
          encryption_enabled,
          checksum,
          created_by
        `)
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Mettre à jour le statut d'un backup
   */
  static async updateBackupStatus(
    id: string,
    status: 'completed' | 'failed',
    size?: number,
    duration?: number,
    checksum?: string
  ): Promise<ServiceResponse<Backup | null>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(null, 'Supabase non configuré');
      }

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (size !== undefined) updateData.size = size;
      if (duration !== undefined) updateData.duration = duration;
      if (checksum) updateData.checksum = checksum;

      const { data, error } = await this.getSupabaseClient()
        .from('backups')
        .update(updateData)
        .eq('id', id)
        .select(`
          id,
          name,
          type,
          size,
          status,
          created_at,
          updated_at,
          duration,
          location,
          description,
          tables_count,
          records_count,
          compression_ratio,
          encryption_enabled,
          checksum,
          created_by
        `)
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Supprimer un backup
   */
  static async deleteBackup(id: string): Promise<ServiceResponse<boolean>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(false, 'Supabase non configuré');
      }

      const { error } = await this.getSupabaseClient()
        .from('backups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Télécharger un backup
   */
  static async downloadBackup(id: string): Promise<ServiceResponse<{ downloadUrl: string; filename: string }>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse({ downloadUrl: '', filename: '' }, 'Supabase non configuré');
      }

      // Récupérer les informations du backup
      const backupResponse = await this.getById(id);
      if (!backupResponse.success || !backupResponse.data) {
        return this.createResponse({ downloadUrl: '', filename: '' }, 'Backup non trouvé');
      }

      const backup = backupResponse.data;
      
      // Simuler l'URL de téléchargement (dans un vrai projet, ceci générerait une URL signée)
      const downloadUrl = `/api/backup/download/${id}`;
      const filename = `${backup.name}.sql`;

      return this.createResponse({ downloadUrl, filename });
    } catch (error) {
      return this.createResponse({ downloadUrl: '', filename: '' }, this.handleError(error));
    }
  }

  /**
   * Restaurer un backup
   */
  static async restoreBackup(restoreRequest: RestoreRequest): Promise<ServiceResponse<boolean>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(false, 'Supabase non configuré');
      }

      // Vérifier que le backup existe
      const backupResponse = await this.getById(restoreRequest.backup_id);
      if (!backupResponse.success || !backupResponse.data) {
        return this.createResponse(false, 'Backup non trouvé');
      }

      const backup = backupResponse.data;

      if (backup.status !== 'completed') {
        return this.createResponse(false, 'Le backup doit être terminé pour être restauré');
      }

      // Simuler le processus de restauration
      // Dans un vrai projet, ceci déclencherait un processus de restauration
      console.log('Démarrage de la restauration:', {
        backupId: restoreRequest.backup_id,
        type: restoreRequest.restore_type,
        tables: restoreRequest.tables_to_restore
      });

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Récupérer les paramètres de backup
   */
  static async getSettings(): Promise<ServiceResponse<BackupSettings | null>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(null, 'Supabase non configuré');
      }

      const { data, error } = await this.getSupabaseClient()
        .from('backup_settings')
        .select('*')
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Mettre à jour les paramètres de backup
   */
  static async updateSettings(settings: Partial<BackupSettings>): Promise<ServiceResponse<BackupSettings | null>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(null, 'Supabase non configuré');
      }

      const { data, error } = await this.getSupabaseClient()
        .from('backup_settings')
        .upsert([{
          ...settings,
          updated_at: new Date().toISOString()
        }])
        .select('*')
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Obtenir les statistiques des backups
   */
  static async getStats(): Promise<ServiceResponse<BackupStats>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse({
          total_backups: 0,
          total_size: 0,
          successful_backups: 0,
          failed_backups: 0,
          success_rate: 0,
          storage_used: 0,
          storage_available: 0,
          storage_percentage: 0
        }, 'Supabase non configuré');
      }

      // Récupérer toutes les statistiques
      const { data: backups, error: backupsError } = await this.getSupabaseClient()
        .from('backups')
        .select('id, size, status, created_at');

      if (backupsError) throw backupsError;

      const totalBackups = backups?.length || 0;
      const totalSize = backups?.reduce((sum: any, backup: any) => sum + (backup.size || 0), 0) || 0;
      const successfulBackups = backups?.filter((b: any) => b.status === 'completed').length || 0;
      const failedBackups = backups?.filter((b: any) => b.status === 'failed').length || 0;
      const successRate = totalBackups > 0 ? (successfulBackups / totalBackups) * 100 : 0;

      // Trouver le dernier backup
      const lastBackup = backups?.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      // Simuler l'espace de stockage
      const storageUsed = totalSize;
      const storageAvailable = 10 * 1024 * 1024 * 1024; // 10 GB
      const storagePercentage = (storageUsed / storageAvailable) * 100;

      return this.createResponse({
        total_backups: totalBackups,
        total_size: totalSize,
        successful_backups: successfulBackups,
        failed_backups: failedBackups,
        success_rate: successRate,
        last_backup_date: lastBackup?.created_at,
        next_scheduled_backup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
        storage_used: storageUsed,
        storage_available: storageAvailable,
        storage_percentage: storagePercentage
      });
    } catch (error) {
      return this.createResponse({
        total_backups: 0,
        total_size: 0,
        successful_backups: 0,
        failed_backups: 0,
        success_rate: 0,
        storage_used: 0,
        storage_available: 0,
        storage_percentage: 0
      }, this.handleError(error));
    }
  }

  /**
   * Tester la connexion de stockage
   */
  static async testStorageConnection(location: 'local' | 'cloud' | 'external'): Promise<ServiceResponse<boolean>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse(false, 'Supabase non configuré');
      }

      // Simuler le test de connexion
      // Dans un vrai projet, ceci testerait la connexion au stockage
      console.log(`Test de connexion au stockage ${location}`);

      // Simuler un délai de test
      await new Promise(resolve => setTimeout(resolve, 1000));

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Nettoyer les anciens backups
   */
  static async cleanupOldBackups(retentionDays: number): Promise<ServiceResponse<{ deleted: number }>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse({ deleted: 0 }, 'Supabase non configuré');
      }

      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();

      const { data: oldBackups, error: selectError } = await this.getSupabaseClient()
        .from('backups')
        .select('id')
        .lt('created_at', cutoffDate)
        .eq('status', 'completed');

      if (selectError) throw selectError;

      if (oldBackups && oldBackups.length > 0) {
        const { error: deleteError } = await this.getSupabaseClient()
          .from('backups')
          .delete()
          .in('id', oldBackups.map((b: any) => b.id));

        if (deleteError) throw deleteError;

        return this.createResponse({ deleted: oldBackups.length });
      }

      return this.createResponse({ deleted: 0 });
    } catch (error) {
      return this.createResponse({ deleted: 0 }, this.handleError(error));
    }
  }
}