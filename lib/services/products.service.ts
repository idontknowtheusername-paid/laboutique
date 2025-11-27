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
  // Flash sale fields
  is_flash_sale?: boolean;
  flash_price?: number;
  flash_end_date?: string;
  flash_max_quantity?: number;
  flash_sold_quantity?: number;
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
  price_min?: number;
  price_max?: number;
  in_stock?: boolean;
  brand?: string;
  tags?: string[];
  search?: string;
  platform?: 'aliexpress' | 'alibaba' | 'manual';
  source_platform?: 'aliexpress' | 'alibaba' | 'manual';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
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
   * Vérifier si les colonnes flash sale existent
   */
  // Les colonnes flash sale existent toujours maintenant
  private static flashSaleColumnsExist: boolean | null = true;

  private static async checkFlashSaleColumns(): Promise<boolean> {
    // Les colonnes flash sale sont maintenant standard, toujours retourner true
    return true;
  }

  private static getProductSelectFields(includeFlashSale: boolean = false): string {
    const baseFields = `
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
    `;

    const flashSaleFields = `
      is_flash_sale,
      flash_price,
      flash_end_date,
      flash_max_quantity,
      flash_sold_quantity,
    `;

    return includeFlashSale ? flashSaleFields + baseFields : baseFields;
  }

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

      // Vérifier si les colonnes flash sale existent
      const hasFlashSaleColumns = await this.checkFlashSaleColumns();

      let query = this.getSupabaseClient()
        .from('products')
        .select(this.getProductSelectFields(hasFlashSaleColumns), { count: 'exact' });

      // Appliquer les filtres
      // Note: Si status est undefined, on affiche TOUS les statuts (pour l'admin)
      // Si status est défini, on filtre sur ce statut spécifique
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      // Pas de filtre par défaut - l'appelant doit spécifier explicitement

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
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`);
      }

      // Nouveaux filtres
      if (filters.platform || filters.source_platform) {
        const platform = filters.platform || filters.source_platform;
        if (platform === 'manual') {
          query = query.is('source_platform', null);
        } else if (platform === 'aliexpress' || platform === 'alibaba') {
          query = query.eq('source_platform', platform);
        }
      }

      if (filters.price_min !== undefined) {
        query = query.gte('price', filters.price_min);
      }

      if (filters.price_max !== undefined) {
        query = query.lte('price', filters.price_max);
      }

      // Appliquer le tri
      const sortField = filters.sort_by || sort.field;
      const sortDirection = filters.sort_order || sort.direction;
      const ascending = sortDirection === 'asc';
      query = query.order(sortField, { ascending });

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
      // Vérifier si les colonnes flash sale existent
      const hasFlashSaleColumns = await this.checkFlashSaleColumns();

      const selectFields = hasFlashSaleColumns
        ? this.getProductSelectFields(true).replace('vendor:vendors(id, name, slug, logo_url)', 'vendor:vendors(id, name, slug, logo_url, description)')
        : this.getProductSelectFields(false).replace('vendor:vendors(id, name, slug, logo_url)', 'vendor:vendors(id, name, slug, logo_url, description)');

      const { data, error } = await this.getSupabaseClient()
        .from('products')
        .select(selectFields)
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
          source_url,
          source_platform,
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
          source_url,
          source_platform,
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
   * Récupérer les top ventes (système simple basé sur les vraies ventes + fallback récents attractifs)
   */
  static async getTopSellers(limit: number = 8): Promise<ServiceResponse<Product[]>> {
    try {
      if (!isSupabaseConfigured()) {
        return this.createResponse([], 'Supabase non configuré');
      }

      const allProducts: Product[] = [];
      const existingIds = new Set<string>();

      // 1. PRIORITÉ 1 : Produits avec vraies ventes
      const productsWithSales = await this.getProductsWithRealSales(limit);
      productsWithSales.forEach(product => {
        if (allProducts.length < limit) {
          allProducts.push(product);
          existingIds.add(product.id);
        }
      });

      // 2. PRIORITÉ 2 : Si pas assez, compléter avec produits récents attractifs
      if (allProducts.length < limit) {
        const needed = limit - allProducts.length;
        const recentAttractive = await this.getRecentAttractiveProducts(needed * 2); // Plus large pour filtrer les doublons

        recentAttractive.forEach(product => {
          if (!existingIds.has(product.id) && allProducts.length < limit) {
            allProducts.push(product);
            existingIds.add(product.id);
          }
        });
      }

      return this.createResponse(allProducts);
    } catch (error) {
      console.warn('Erreur lors du calcul des top ventes:', error);
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Récupérer les produits avec vraies ventes
   */
  private static async getProductsWithRealSales(limit: number): Promise<Product[]> {
    try {
      const hasFlashSaleColumns = await this.checkFlashSaleColumns();

      // Récupérer les produits actifs
      const { data: products, error } = await this.getSupabaseClient()
        .from('products')
        .select(this.getProductSelectFields(hasFlashSaleColumns))
        .eq('status', 'active')
        .limit(limit * 3); // Plus large pour avoir du choix

      if (error || !products) return [];

      // Calculer les ventes pour chaque produit
      const productsWithSales = await Promise.all(
        products.map(async (product: any) => {
          try {
            const { count } = await this.getSupabaseClient()
              .from('order_items')
              .select('*', { count: 'exact', head: true })
              .eq('product_id', product.id);

            return {
              ...product,
              sales_count: count || 0
            };
          } catch (err) {
            return {
              ...product,
              sales_count: 0
            };
          }
        })
      );

      // Filtrer seulement ceux avec des ventes réelles et trier
      return productsWithSales
        .filter(product => product.sales_count > 0)
        .sort((a, b) => {
          if (b.sales_count !== a.sales_count) {
            return b.sales_count - a.sales_count;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
        .slice(0, limit);
    } catch (error) {
      console.warn('Erreur lors de la récupération des produits avec ventes:', error);
      return [];
    }
  }

  /**
   * Récupérer les produits récents attractifs (< 30 jours + prix < 40k XOF)
   */
  private static async getRecentAttractiveProducts(limit: number): Promise<Product[]> {
    try {
      const hasFlashSaleColumns = await this.checkFlashSaleColumns();

      // Date limite : 30 jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await this.getSupabaseClient()
        .from('products')
        .select(this.getProductSelectFields(hasFlashSaleColumns))
        .eq('status', 'active')
        .gte('created_at', thirtyDaysAgo.toISOString()) // Créé dans les 30 derniers jours
        .lt('price', 40000) // Prix < 40k XOF
        .order('created_at', { ascending: false }) // Plus récents d'abord
        .order('price', { ascending: true }) // Puis par prix croissant (plus attractifs)
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.warn('Erreur lors de la récupération des produits récents attractifs:', error);
      return [];
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
      const slug = productData.slug?.trim() || this.generateSlug(productData.name);

      // Filtrer les champs qui n'existent pas dans la base de données et mapper certains champs d'import
      const { specifications, original_price, ...rest } = productData as any;
      const validProductData = {
        ...rest,
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
   * Create using a supplied supabase client (e.g., service-role for RLS bypass)
   */
  static async createWithClient(client: any, productData: CreateProductData): Promise<ServiceResponse<Product | null>> {
    try {
      const slug = productData.slug?.trim() || this.generateSlug(productData.name);
      const { specifications, original_price, ...rest } = productData as any;
      const validProductData = {
        ...rest,
        compare_price: (rest as any).compare_price ?? original_price,
      } as any;

      const { data, error } = await client
        .from('products')
        .insert([{
          ...validProductData,
          slug,
          track_quantity: productData.track_quantity ?? true,
          quantity: productData.quantity ?? 0,
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