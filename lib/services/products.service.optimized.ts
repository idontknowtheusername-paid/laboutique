import { cacheUtils } from '../cache/cache-strategy';

// Service de produits optimisé avec cache
export class ProductsServiceOptimized {
  // Obtenir un produit avec cache
  static async getById(id: string) {
    return await cacheUtils.getProduct(id);
  }

  // Obtenir les produits populaires avec cache
  static async getPopular(limit: number = 8) {
    return await cacheUtils.getSearchResults('popular', { limit });
  }

  // Rechercher des produits avec cache
  static async search(query: string, filters: any = {}) {
    return await cacheUtils.getSearchResults(query, filters);
  }

  // Obtenir les catégories avec cache
  static async getCategories() {
    return await cacheUtils.getCategories();
  }
}