import fs from 'fs';
import path from 'path';

interface MockCategory {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface MockVendor {
  id: string;
  name: string;
  slug: string;
  email: string;
  status: string;
}

interface MockProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  sku: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
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
  source_url?: string;
  source_platform?: 'aliexpress' | 'alibaba';
  created_at: string;
  updated_at: string;
}

interface MockDatabase {
  categories: MockCategory[];
  vendors: MockVendor[];
  products: MockProduct[];
}

export class MockDbService {
  private static dbPath = path.join(process.cwd(), 'mock-db.json');
  
  private static readDb(): MockDatabase {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[MOCK-DB] Error reading database:', error);
    }
    
    // Return empty database if file doesn't exist or is corrupted
    return {
      categories: [],
      vendors: [],
      products: []
    };
  }
  
  private static writeDb(db: MockDatabase): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(db, null, 2));
    } catch (error) {
      console.error('[MOCK-DB] Error writing database:', error);
    }
  }
  
  static getCategories(): MockCategory[] {
    const db = this.readDb();
    return db.categories.filter(cat => cat.status === 'active');
  }
  
  static getVendors(): MockVendor[] {
    const db = this.readDb();
    return db.vendors.filter(vendor => vendor.status === 'active');
  }
  
  static findCategoryBySlug(slug: string): MockCategory | null {
    const categories = this.getCategories();
    return categories.find(cat => cat.slug === slug) || null;
  }
  
  static findVendorBySlug(slug: string): MockVendor | null {
    const vendors = this.getVendors();
    return vendors.find(vendor => vendor.slug === slug) || null;
  }
  
  static createCategory(categoryData: Partial<MockCategory>): MockCategory {
    const db = this.readDb();
    const newCategory: MockCategory = {
      id: `cat-${Date.now()}`,
      name: categoryData.name || 'Nouvelle Catégorie',
      slug: categoryData.slug || `categorie-${Date.now()}`,
      status: categoryData.status || 'active'
    };
    
    db.categories.push(newCategory);
    this.writeDb(db);
    
    console.log('[MOCK-DB] ✅ Catégorie créée:', newCategory);
    return newCategory;
  }
  
  static createVendor(vendorData: Partial<MockVendor>): MockVendor {
    const db = this.readDb();
    const newVendor: MockVendor = {
      id: `vendor-${Date.now()}`,
      name: vendorData.name || 'Nouveau Vendeur',
      slug: vendorData.slug || `vendeur-${Date.now()}`,
      email: vendorData.email || 'contact@laboutique.bj',
      status: vendorData.status || 'active'
    };
    
    db.vendors.push(newVendor);
    this.writeDb(db);
    
    console.log('[MOCK-DB] ✅ Vendeur créé:', newVendor);
    return newVendor;
  }
  
  static createProduct(productData: Partial<MockProduct>): MockProduct {
    const db = this.readDb();
    const now = new Date().toISOString();
    
    const newProduct: MockProduct = {
      id: `prod-${Date.now()}`,
      name: productData.name || 'Nouveau Produit',
      slug: productData.slug || `produit-${Date.now()}`,
      description: productData.description,
      short_description: productData.short_description,
      sku: productData.sku || `SKU-${Date.now()}`,
      price: productData.price || 0,
      compare_price: productData.compare_price,
      cost_price: productData.cost_price,
      track_quantity: productData.track_quantity ?? true,
      quantity: productData.quantity ?? 0,
      weight: productData.weight,
      dimensions: productData.dimensions,
      category_id: productData.category_id,
      vendor_id: productData.vendor_id || '',
      brand: productData.brand,
      tags: productData.tags,
      images: productData.images || [],
      status: productData.status || 'draft',
      featured: productData.featured ?? false,
      meta_title: productData.meta_title,
      meta_description: productData.meta_description,
      source_url: productData.source_url,
      source_platform: productData.source_platform,
      created_at: now,
      updated_at: now
    };
    
    db.products.push(newProduct);
    this.writeDb(db);
    
    console.log('[MOCK-DB] ✅ Produit créé:', {
      id: newProduct.id,
      name: newProduct.name,
      category_id: newProduct.category_id,
      vendor_id: newProduct.vendor_id,
      status: newProduct.status
    });
    
    return newProduct;
  }
  
  static getProducts(): MockProduct[] {
    const db = this.readDb();
    return db.products;
  }
  
  static findProductBySlug(slug: string): MockProduct | null {
    const products = this.getProducts();
    return products.find(product => product.slug === slug) || null;
  }
  
  static findProductBySourceUrl(sourceUrl: string): MockProduct | null {
    const products = this.getProducts();
    return products.find(product => product.source_url === sourceUrl) || null;
  }
}