import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';

export interface ArticlePost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image_url?: string;
  status: 'draft' | 'published' | 'archived';
  author_id: string;
  published_at?: string;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
  author?: { id: string; first_name?: string; last_name?: string };
}

export interface ArticleFilters {
  status?: 'draft' | 'published' | 'archived';
  search?: string;
}

export interface CreateArticleData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image_url?: string;
  status?: 'draft' | 'published' | 'archived';
  author_id: string;
  seo_title?: string;
  seo_description?: string;
}

export interface UpdateArticleData extends Partial<CreateArticleData> {
  id: string;
}

export class ArticlesService extends BaseService {
  static async getAll(
    filters: ArticleFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<ArticlePost>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = this.getSupabaseClient()
        .from('posts')
        .select(`*, author:profiles(id, first_name, last_name)`, { count: 'exact' });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      const total = count || 0;
      const paginationInfo = this.calculatePagination(page, limit, total);
      return this.createPaginatedResponse(data || [], paginationInfo);
    } catch (error) {
      return this.createPaginatedResponse([], { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false }, this.handleError(error));
    }
  }

  static async getById(id: string): Promise<ServiceResponse<ArticlePost | null>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('posts')
        .select(`*, author:profiles(id, first_name, last_name)`) 
        .eq('id', id)
        .single();
      if (error) throw error;
      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async getBySlug(slug: string): Promise<ServiceResponse<ArticlePost | null>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('posts')
        .select(`*, author:profiles(id, first_name, last_name)`) 
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async create(article: CreateArticleData): Promise<ServiceResponse<ArticlePost | null>> {
    try {
      const { data, error } = await (this.getSupabaseClient() as any)
        .from('posts')
        .insert([{ 
          ...article,
          status: article.status ?? 'draft',
          published_at: article.status === 'published' ? new Date().toISOString() : null
        }])
        .select(`*, author:profiles(id, first_name, last_name)`) 
        .single();
      if (error) throw error;
      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async update(updateData: UpdateArticleData): Promise<ServiceResponse<ArticlePost | null>> {
    try {
      const { id, ...rest } = updateData;
      const { data, error } = await (this.getSupabaseClient() as any)
        .from('posts')
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`*, author:profiles(id, first_name, last_name)`) 
        .single();
      if (error) throw error;
      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async publish(id: string): Promise<ServiceResponse<ArticlePost | null>> {
    return this.update({ id, status: 'published', published_at: new Date().toISOString() } as any);
  }

  static async archive(id: string): Promise<ServiceResponse<ArticlePost | null>> {
    return this.update({ id, status: 'archived' });
  }

  static async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient().from('posts').delete().eq('id', id);
      if (error) throw error;
      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }
}

