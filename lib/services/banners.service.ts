import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';

export interface Banner {
  id: string;
  title: string;
  slot: 'homepage-hero' | 'homepage-mid' | 'category-top' | 'category-mid' | 'global';
  image_url: string;
  link_url?: string;
  start_at?: string;
  end_at?: string;
  is_active: boolean;
  priority: number;
  created_at?: string;
  updated_at?: string;
}

export interface BannerFilters {
  slot?: Banner['slot'];
  is_active?: boolean;
  search?: string;
}

export interface CreateBannerData extends Omit<Banner, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateBannerData extends Partial<CreateBannerData> { id: string; }

export class BannersService extends BaseService {
  static async getAll(filters: BannerFilters = {}, pagination: PaginationParams = {}): Promise<PaginatedResponse<Banner>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = this.getSupabaseClient()
        .from('banners')
        .select('*', { count: 'exact' });

      if (filters.slot) query = query.eq('slot', filters.slot);
      if (typeof filters.is_active === 'boolean') query = query.eq('is_active', filters.is_active);
      if (filters.search) query = query.ilike('title', `%${filters.search}%`);

      const { data, error, count } = await query
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const paginationInfo = this.calculatePagination(page, limit, total);
      return this.createPaginatedResponse((data as Banner[]) || [], paginationInfo);
    } catch (error) {
      return this.createPaginatedResponse([], { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false }, this.handleError(error));
    }
  }

  static async create(payload: CreateBannerData): Promise<ServiceResponse<Banner | null>> {
    try {
      const { data, error } = await (this.getSupabaseClient() as any)
        .from('banners')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return this.createResponse(data as Banner);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async update(update: UpdateBannerData): Promise<ServiceResponse<Banner | null>> {
    try {
      const { id, ...rest } = update;
      const { data, error } = await (this.getSupabaseClient() as any)
        .from('banners')
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return this.createResponse(data as Banner);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient().from('banners').delete().eq('id', id);
      if (error) throw error;
      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }
}

