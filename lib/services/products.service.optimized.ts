import { ProductsService } from './products.service';

// Service de produits optimisé (version simplifiée sans cache Redis)
export class ProductsServiceOptimized {
  // Obtenir un produit
  static async getById(id: string) {
    return await ProductsService.getBySlug(id);
  }

  // Obtenir les produits populaires
  static async getPopular(limit: number = 8) {
    return await ProductsService.getPopular(limit);
  }

  // Rechercher des produits
  static async search(query: string, filters: any = {}) {
    return await ProductsService.search(query, filters);
  }

  // Obtenir les catégories
  static async getCategories() {
    return await ProductsService.getCategories();
  }

  // Obtenir les produits par catégorie
  static async getByCategory(category: string, options: { limit: number }) {
    return await ProductsService.getByCategory(category, options);
  }
}