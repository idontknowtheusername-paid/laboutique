import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';

export interface CategoryReference {
    id: string;
    name: string;
    slug: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    parent_id?: string;
    sort_order: number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    product_count?: number;
    children?: Category[];
    parent?: CategoryReference;
}

export interface CategoryFilters {
    status?: 'active' | 'inactive';
    parent_id?: string | null;
    search?: string;
}

export interface CreateCategoryData {
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    parent_id?: string;
    sort_order?: number;
    status?: 'active' | 'inactive';
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
    id: string;
}

export class CategoriesService extends BaseService {
    /**
     * Récupérer toutes les catégories avec pagination
     */
    static async getAll(
        filters: CategoryFilters = {},
        pagination: PaginationParams = {}
    ): Promise<PaginatedResponse<Category>> {
        try {
            const { page = 1, limit = 20 } = pagination;
            const offset = (page - 1) * limit;

            let query = this.getSupabaseClient()
                .from('categories')
                .select('*', { count: 'exact' });

            // Appliquer les filtres
            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            if (filters.parent_id !== undefined) {
                if (filters.parent_id === null) {
                    query = query.is('parent_id', null);
                } else {
                    query = query.eq('parent_id', filters.parent_id);
                }
            }

            if (filters.search) {
                query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
            }

            const { data, error, count } = await query
                .order('sort_order', { ascending: true })
                .order('name', { ascending: true })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            const total = count || 0;
            const paginationInfo = this.calculatePagination(page, limit, total);

            return this.createPaginatedResponse((data as Category[]) || [], paginationInfo);
        } catch (error) {
            return this.createPaginatedResponse([], {
                page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false
            }, this.handleError(error));
        }
    }

    /**
     * Récupérer une catégorie par son slug
     */
    static async getBySlug(slug: string): Promise<ServiceResponse<Category | null>> {
        try {
            const { data, error } = await this.getSupabaseClient()
                .from('categories')
                .select('*')
                .eq('slug', slug)
                .eq('status', 'active')
                .single();

            if (error) throw error;

            if (!data) {
                return this.createResponse(null);
            }

            const categoryData = data as any;

            // Récupérer les enfants séparément
            const { data: children } = await this.getSupabaseClient()
                .from('categories')
                .select('id, name, slug, sort_order, description, image_url, parent_id, status, created_at, updated_at')
                .eq('parent_id', categoryData.id)
                .eq('status', 'active')
                .order('sort_order', { ascending: true });

            // Récupérer le parent séparément si nécessaire
            let parent: CategoryReference | null = null;
            if (categoryData.parent_id) {
                const { data: parentData } = await this.getSupabaseClient()
                    .from('categories')
                    .select('id, name, slug')
                    .eq('id', categoryData.parent_id)
                    .single();
                parent = parentData as CategoryReference;
            }

            const result: Category = {
                id: categoryData.id,
                name: categoryData.name,
                slug: categoryData.slug,
                description: categoryData.description,
                image_url: categoryData.image_url,
                parent_id: categoryData.parent_id,
                sort_order: categoryData.sort_order,
                status: categoryData.status,
                created_at: categoryData.created_at,
                updated_at: categoryData.updated_at,
                children: (children as Category[]) || [],
                parent
            };

            return this.createResponse(result);
        } catch (error) {
            return this.createResponse(null, this.handleError(error));
        }
    }

    /**
     * Récupérer l'arbre des catégories (hiérarchique)
     */
    static async getCategoryTree(): Promise<ServiceResponse<Category[]>> {
        try {
            // Récupérer toutes les catégories actives
            const { data: allCategories, error } = await this.getSupabaseClient()
                .from('categories')
                .select('*')
                .eq('status', 'active')
                .order('sort_order', { ascending: true })
                .order('name', { ascending: true });

            if (error) throw error;

            if (!allCategories || allCategories.length === 0) {
                return this.createResponse([]);
            }

            const categoriesData = allCategories as any[];

            // Construire l'arbre hiérarchique
            const categoryMap = new Map<string, Category>();
            const rootCategories: Category[] = [];

            // Première passe : créer la map et identifier les catégories racines
            categoriesData.forEach(categoryData => {
                const category: Category = {
                    id: categoryData.id,
                    name: categoryData.name,
                    slug: categoryData.slug,
                    description: categoryData.description,
                    image_url: categoryData.image_url,
                    parent_id: categoryData.parent_id,
                    sort_order: categoryData.sort_order,
                    status: categoryData.status,
                    created_at: categoryData.created_at,
                    updated_at: categoryData.updated_at,
                    children: []
                };

                categoryMap.set(category.id, category);

                if (!category.parent_id) {
                    rootCategories.push(category);
                }
            });

            // Deuxième passe : construire les relations parent-enfant
            categoriesData.forEach(categoryData => {
                if (categoryData.parent_id && categoryMap.has(categoryData.parent_id)) {
                    const parent = categoryMap.get(categoryData.parent_id)!;
                    const child = categoryMap.get(categoryData.id)!;

                    child.parent = {
                        id: parent.id,
                        name: parent.name,
                        slug: parent.slug
                    };

                    parent.children!.push(child);
                }
            });

            return this.createResponse(rootCategories);
        } catch (error) {
            return this.createResponse([], this.handleError(error));
        }
    }

    /**
     * Récupérer les catégories avec le nombre de produits
     */
    static async getWithProductCount(): Promise<ServiceResponse<Category[]>> {
        try {
            // Récupérer d'abord les catégories
            const { data: categories, error: categoriesError } = await this.getSupabaseClient()
                .from('categories')
                .select('*')
                .eq('status', 'active')
                .order('name', { ascending: true });

            if (categoriesError) throw categoriesError;

            if (!categories || categories.length === 0) {
                return this.createResponse([]);
            }

            const categoriesData = categories as any[];

            // Ensuite récupérer le nombre de produits pour chaque catégorie
            const categoriesWithCount = await Promise.all(
                categoriesData.map(async (categoryData) => {
                    const { count } = await this.getSupabaseClient()
                        .from('products')
                        .select('*', { count: 'exact', head: true })
                        .eq('category_id', categoryData.id)
                        .eq('status', 'active');

                    const category: Category = {
                        id: categoryData.id,
                        name: categoryData.name,
                        slug: categoryData.slug,
                        description: categoryData.description,
                        image_url: categoryData.image_url,
                        parent_id: categoryData.parent_id,
                        sort_order: categoryData.sort_order,
                        status: categoryData.status,
                        created_at: categoryData.created_at,
                        updated_at: categoryData.updated_at,
                        product_count: count || 0
                    };

                    return category;
                })
            );

            return this.createResponse(categoriesWithCount);
        } catch (error) {
            return this.createResponse([], this.handleError(error));
        }
    }

    /**
     * Récupérer les catégories populaires (avec le plus de produits)
     */
    static async getPopular(limit: number = 10): Promise<ServiceResponse<Category[]>> {
        try {
            // Récupérer les catégories avec leur nombre de produits
            const response = await this.getWithProductCount();
            if (!response.success || !response.data) {
                return this.createResponse([], response.error);
            }

            // Trier par nombre de produits et limiter
            const sortedCategories = response.data
                .sort((a, b) => (b.product_count || 0) - (a.product_count || 0))
                .slice(0, limit);

            return this.createResponse(sortedCategories);
        } catch (error) {
            return this.createResponse([], this.handleError(error));
        }
    }

    /**
     * Créer une nouvelle catégorie
     */
    static async create(categoryData: CreateCategoryData): Promise<ServiceResponse<Category | null>> {
        try {
            const insertData = {
                name: categoryData.name,
                slug: categoryData.slug,
                description: categoryData.description || null,
                image_url: categoryData.image_url || null,
                parent_id: categoryData.parent_id || null,
                sort_order: categoryData.sort_order || 0,
                status: categoryData.status || 'active'
            };

            // Utiliser une approche différente pour contourner les problèmes de typage
            const supabaseClient = this.getSupabaseClient() as any;
            const { data, error } = await supabaseClient
                .from('categories')
                .insert(insertData)
                .select()
                .single();

            if (error) throw error;

            return this.createResponse(data as Category);
        } catch (error) {
            return this.createResponse(null, this.handleError(error));
        }
    }

    /**
     * Mettre à jour une catégorie
     */
    static async update(updateData: UpdateCategoryData): Promise<ServiceResponse<Category | null>> {
        try {
            const { id, ...dataToUpdate } = updateData;

            const updatePayload: Record<string, any> = {
                updated_at: new Date().toISOString()
            };

            // Ajouter seulement les champs qui sont définis
            if (dataToUpdate.name !== undefined) updatePayload.name = dataToUpdate.name;
            if (dataToUpdate.slug !== undefined) updatePayload.slug = dataToUpdate.slug;
            if (dataToUpdate.description !== undefined) updatePayload.description = dataToUpdate.description;
            if (dataToUpdate.image_url !== undefined) updatePayload.image_url = dataToUpdate.image_url;
            if (dataToUpdate.parent_id !== undefined) updatePayload.parent_id = dataToUpdate.parent_id;
            if (dataToUpdate.sort_order !== undefined) updatePayload.sort_order = dataToUpdate.sort_order;
            if (dataToUpdate.status !== undefined) updatePayload.status = dataToUpdate.status;

            // Utiliser une approche différente pour contourner les problèmes de typage
            const supabaseClient = this.getSupabaseClient() as any;
            const { data, error } = await supabaseClient
                .from('categories')
                .update(updatePayload)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return this.createResponse(data as Category);
        } catch (error) {
            return this.createResponse(null, this.handleError(error));
        }
    }

    /**
     * Supprimer une catégorie
     */
    static async delete(id: string): Promise<ServiceResponse<boolean>> {
        try {
            const supabaseClient = this.getSupabaseClient() as any;
            const { error } = await supabaseClient
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return this.createResponse(true);
        } catch (error) {
            return this.createResponse(false, this.handleError(error));
        }
    }

    /**
     * Rechercher des catégories
     */
    static async search(query: string, limit: number = 10): Promise<ServiceResponse<Category[]>> {
        try {
            const { data, error } = await this.getSupabaseClient()
                .from('categories')
                .select('*')
                .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
                .eq('status', 'active')
                .order('name', { ascending: true })
                .limit(limit);

            if (error) throw error;

            return this.createResponse((data as Category[]) || []);
        } catch (error) {
            return this.createResponse([], this.handleError(error));
        }
    }
}