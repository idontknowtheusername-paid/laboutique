import { ProductsService, CategoriesService } from '../services';

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        limit: jest.fn(() => ({
          offset: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => Promise.resolve({ data: null, error: null })),
      delete: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}));

describe('Services', () => {
  describe('ProductsService', () => {
    test('should get popular products', async () => {
      const result = await ProductsService.getPopular(5);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    test('should get products by category', async () => {
      const result = await ProductsService.getByCategory('electronique', { limit: 10 });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    test('should search products', async () => {
      const result = await ProductsService.search('smartphone', { limit: 10 });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('CategoriesService', () => {
    test('should get all categories', async () => {
      const result = await CategoriesService.getAll();
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    test('should get category by slug', async () => {
      const result = await CategoriesService.getBySlug('electronique');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});