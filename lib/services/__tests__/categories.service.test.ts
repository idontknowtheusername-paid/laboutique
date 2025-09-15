// Test basique pour vérifier que le service des catégories fonctionne
import { CategoriesService } from '../categories.service';

// Mock de Supabase pour les tests
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
          }))
        })),
        or: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: null }))
            }))
          }))
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null }))
        }))
      }))
    }))
  }
}));

describe('CategoriesService', () => {
  describe('slugExists', () => {
    it('should return false when slug does not exist', async () => {
      const exists = await CategoriesService.slugExists('non-existent-slug');
      expect(exists).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return paginated categories', async () => {
      const result = await CategoriesService.getAll();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.pagination).toBeDefined();
    });
  });

  describe('search', () => {
    it('should return search results', async () => {
      const result = await CategoriesService.search('test');
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });
});