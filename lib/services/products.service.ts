import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';
import { isSupabaseConfigured } from '@/lib/supabase';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  sku: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  original_price?: number;
  track_quantity: boolean;
  quantity: number;
  weight?: number;
  dimensions?: any;
  category_id?: string;
  vendor_id: string;
  brand?: string;
  tags?: string[];
  images?: string[];
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  meta_title?: string;
  meta_description?: string;
  specifications?: Record<string, string>;
  // Optional runtime-only fields (not necessarily in DB)
  source_url?: string;
  source_platform?: 'aliexpress' | 'alibaba';
  created_at: string;
  updated_at: string;
  // Relations
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  vendor?: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
  };
  reviews_count?: number;
  average_rating?: number;
}

export interface ProductFilters {
  category_id?: string;
  category_slug?: string;
  vendor_id?: string;
  vendor_slug?: string;
  status?: 'active' | 'inactive' | 'draft';
  featured?: boolean;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  brand?: string;
  tags?: string[];
  search?: string;
}

export interface ProductSortOptions {
  field: 'name' | 'price' | 'created_at' | 'updated_at' | 'average_rating';
  direction: 'asc' | 'desc';
}

export interface CreateProductData {
  name: string;
  slug?: string; // Optionnel - généré automatiquement si pas fourni
  description?: string;
  short_description?: string;
  sku: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  original_price?: number;
  track_quantity?: boolean;
  quantity?: number;
  weight?: number;
  dimensions?: any;
  category_id?: string;
  vendor_id: string;
  brand?: string;
  tags?: string[];
  images?: string[];
  status?: 'active' | 'inactive' | 'draft';
  featured?: boolean;
  meta_title?: string;
  meta_description?: string;
  specifications?: Record<string, string>;
  // Optional runtime-only fields (not necessarily in DB)
  source_url?: string;
  source_platform?: 'aliexpress' | 'alibaba';
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export class ProductsService extends BaseService {
  /**
   * Récupérer tous les produits avec pagination et filtres
   */
  static async getAll(
    filters: ProductFilters = {},
    pagination: PaginationParams = {},
    sort: ProductSortOptions = { field: 'created_at', direction: 'desc' }
  ): Promise<PaginatedResponse<Product>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createPaginatedResponse([], { page: 1, limit: pagination.limit || 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false }, 'Supabase non configuré');
      }
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = this.getSupabaseClient()
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          short_description,
          sku,
          price,
          compare_price,
          cost_price,
          track_quantity,
          quantity,
          weight,
          dimensions,
          category_id,
          vendor_id,
          brand,
          tags,
          images,
          status,
          featured,
          meta_title,
          meta_description,
          created_at,
          updated_at,
          category:categories(id, name, slug),
          vendor:vendors(id, name, slug, logo_url)
        `, { count: 'exact' });

      // Appliquer les filtres
      if (filters.status) {
        query = query.eq('status', filters.status);
      } else {
        query = query.eq('status', 'active'); // Par défaut, seulement les produits actifs
      }

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters.vendor_id) {
        query = query.eq('vendor_id', filters.vendor_id);
      }

      if (filters.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }

      if (filters.min_price !== undefined) {
        query = query.gte('price', filters.min_price);
      }

      if (filters.max_price !== undefined) {
        query = query.lte('price', filters.max_price);
      }

      if (filters.in_stock) {
        query = query.gt('quantity', 0);
      }

      if (filters.brand) {
        query = query.ilike('brand', `%${filters.brand}%`);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
      }

      // Appliquer le tri
      const ascending = sort.direction === 'asc';
      query = query.order(sort.field, { ascending });

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
   * Récupérer un produit par son slug
   */
  static async getBySlug(slug: string): Promise<ServiceResponse<Product | null>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          short_description,
          sku,
          price,
          compare_price,
          cost_price,
          track_quantity,
          quantity,
          weight,
          dimensions,
          category_id,
          vendor_id,
          brand,
          tags,
          images,
          status,
          featured,
          meta_title,
          meta_description,
          created_at,
          updated_at,
          category:categories(id, name, slug),
          vendor:vendors(id, name, slug, logo_url, description)
        `)
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer les produits par catégorie
   */
  static async getByCategory(
    categorySlug: string,
    pagination: PaginationParams = {},
    sort: ProductSortOptions = { field: 'created_at', direction: 'desc' }
  ): Promise<PaginatedResponse<Product>> {
    return this.getAll(
      { category_slug: categorySlug },
      pagination,
      sort
    );
  }

  /**
   * Récupérer les produits par vendeur
   */
  static async getByVendor(
    vendorSlug: string,
    pagination: PaginationParams = {},
    sort: ProductSortOptions = { field: 'created_at', direction: 'desc' }
  ): Promise<PaginatedResponse<Product>> {
    return this.getAll(
      { vendor_slug: vendorSlug },
      pagination,
      sort
    );
  }

  /**
   * Récupérer les produits en vedette
   */
  static async getFeatured(limit: number = 10): Promise<ServiceResponse<Product[]>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse([], 'Supabase non configuré');
      }
      const { data, error } = await this.getSupabaseClient()
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          short_description,
          sku,
          price,
          compare_price,
          cost_price,
          track_quantity,
          quantity,
          weight,
          dimensions,
          category_id,
          vendor_id,
          brand,
          tags,
          images,
          status,
          featured,
          meta_title,
          meta_description,
          created_at,
          updated_at,
          category:categories(id, name, slug),
          vendor:vendors(id, name, slug, logo_url)
        `)
        .eq('status', 'active')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Récupérer les produits populaires (les plus vendus)
   */
  static async getPopular(limit: number = 10): Promise<ServiceResponse<Product[]>> {
    try {
      // Récupérer les produits avec leurs ventes
      const { data: products, error } = await (this.getSupabaseClient() as any)
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          short_description,
          sku,
          price,
          compare_price,
          cost_price,
          track_quantity,
          quantity,
          weight,
          dimensions,
          category_id,
          vendor_id,
          brand,
          tags,
          images,
          status,
          featured,
          meta_title,
          meta_description,
          created_at,
          updated_at,
          category:categories(id, name, slug),
          vendor:vendors(id, name, slug, logo_url)
        `)
        .eq('status', 'active')
        .limit(limit * 2); // Récupérer plus pour pouvoir trier

      if (error) throw error;

      if (!products) {
        return this.createResponse([]);
      }

      // Récupérer le nombre de ventes pour chaque produit
      const productsWithSales = await Promise.all(
        products.map(async (product: any) => {
          const { count } = await (this.getSupabaseClient() as any)
            .from('order_items')
            .select('*', { count: 'exact', head: true })
            .eq('product_id', (product as any).id);

          return {
            ...(product as any),
            sales_count: count || 0
          };
        })
      );

      // Trier par nombre de ventes et limiter
      const sortedProducts = productsWithSales
        .sort((a, b) => b.sales_count - a.sales_count)
        .slice(0, limit);

      return this.createResponse(sortedProducts);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Récupérer les nouveaux produits
   */
  static async getNew(limit: number = 10): Promise<ServiceResponse<Product[]>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse([], 'Supabase non configuré');
      }
      const { data, error } = await this.getSupabaseClient()
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          short_description,
          sku,
          price,
          compare_price,
          cost_price,
          track_quantity,
          quantity,
          weight,
          dimensions,
          category_id,
          vendor_id,
          brand,
          tags,
          images,
          status,
          featured,
          meta_title,
          meta_description,
          created_at,
          updated_at,
          category:categories(id, name, slug),
          vendor:vendors(id, name, slug, logo_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Rechercher des produits
   */
  static async search(
    query: string,
    filters: ProductFilters = {},
    pagination: PaginationParams = {},
    sort: ProductSortOptions = { field: 'created_at', direction: 'desc' }
  ): Promise<PaginatedResponse<Product>> {
    return this.getAll(
      { ...filters, search: query },
      pagination,
      sort
    );
  }

  /**
   * Récupérer les produits similaires
   */
  static async getSimilar(
    productId: string,
    limit: number = 6
  ): Promise<ServiceResponse<Product[]>> {
    try {
      // D'abord récupérer le produit pour connaître sa catégorie
      const { data: product, error: productError } = await (this.getSupabaseClient() as any)
        .from('products')
        .select('category_id, tags')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      let query = (this.getSupabaseClient() as any)
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          short_description,
          sku,
          price,
          compare_price,
          cost_price,
          track_quantity,
          quantity,
          weight,
          dimensions,
          category_id,
          vendor_id,
          brand,
          tags,
          images,
          status,
          featured,
          meta_title,
          meta_description,
          created_at,
          updated_at,
          category:categories(id, name, slug),
          vendor:vendors(id, name, slug, logo_url)
        `)
        .eq('status', 'active')
        .neq('id', productId);

      // Filtrer par catégorie si disponible
      if ((product as any).category_id) {
        query = query.eq('category_id', (product as any).category_id);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Générer un slug à partir du nom du produit
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD') // Décomposer les caractères accentués
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul
      .trim() // Supprimer les espaces en début/fin
      .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début/fin
  }

  /**
   * Créer un nouveau produit
   */
  static async create(productData: CreateProductData): Promise<ServiceResponse<Product | null>> {
    try {
      // Générer le slug automatiquement si pas fourni
      const slug = productData.slug?.trim() || this.generateSlug(productData.name);
      
      // Filtrer les champs qui n'existent pas dans la base de données et mapper les champs affichés côté UI
      const { specifications, original_price, ...rest } = productData;
      const validProductData = {
        ...rest,
        // S'assurer que compare_price est renseigné si original_price est fourni par l'import
        compare_price: rest.compare_price ?? original_price,
      } as any;
      
      const { data, error } = await (this.getSupabaseClient() as any)
        .from('products')
        .insert([{
          ...validProductData,
          slug,
          track_quantity: productData.track_quantity ?? true,
          quantity: productData.quantity ?? 0,
          // Respecter le statut fourni par l'appelant (API d'import passe 'active')
          status: productData.status ?? 'draft',
          featured: productData.featured ?? false
        }])
        .select(`
          id,
          name,
          slug,
          description,
          short_description,
          sku,
          price,
          compare_price,
          cost_price,
          track_quantity,
          quantity,
          weight,
          dimensions,
          category_id,
          vendor_id,
          brand,
          tags,
          images,
          status,
          featured,
          meta_title,
          meta_description,
          source_url,
          source_platform,
          created_at,
          updated_at,
          category:categories(id, name, slug),
          vendor:vendors(id, name, slug, logo_url)
        `)
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Mettre à jour un produit
   */
  static async update(updateData: UpdateProductData): Promise<ServiceResponse<Product | null>> {
    try {
      const { id, ...dataToUpdate } = updateData;
      
      const { data, error } = await (this.getSupabaseClient() as any)
        .from('products')
        .update({
          ...dataToUpdate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          id,
          name,
          slug,
          description,
          short_description,
          sku,
          price,
          compare_price,
          cost_price,
          track_quantity,
          quantity,
          weight,
          dimensions,
          category_id,
          vendor_id,
          brand,
          tags,
          images,
          status,
          featured,
          meta_title,
          meta_description,
          created_at,
          updated_at,
          category:categories(id, name, slug),
          vendor:vendors(id, name, slug, logo_url)
        `)
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Supprimer un produit
   */
  static async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.getSupabaseClient()
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Mettre à jour le stock d'un produit
   */
  static async updateStock(id: string, quantity: number): Promise<ServiceResponse<Product | null>> {
    try {
      const { data, error } = await (this.getSupabaseClient() as any)
        .from('products')
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Vérifier la disponibilité d'un produit
   */
  static async checkAvailability(id: string, requestedQuantity: number = 1): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('products')
        .select('quantity, track_quantity, status')
        .eq('id', id)
        .single();

      if (error) throw error;

      const isAvailable = (data as any).status === 'active' && 
        (!(data as any).track_quantity || (data as any).quantity >= requestedQuantity);

      return this.createResponse(isAvailable);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }
}