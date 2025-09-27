#!/usr/bin/env node

/**
 * Mock Database Setup Script
 * This script creates mock data for testing the import functionality
 * when Supabase is not properly configured.
 */

const fs = require('fs');
const path = require('path');

// Mock data for categories
const mockCategories = [
  {
    id: 'cat-1',
    name: 'Électronique',
    slug: 'electronique',
    status: 'active'
  },
  {
    id: 'cat-2', 
    name: 'Mode',
    slug: 'mode',
    status: 'active'
  },
  {
    id: 'cat-3',
    name: 'Maison & Jardin',
    slug: 'maison-jardin',
    status: 'active'
  },
  {
    id: 'cat-4',
    name: 'Beauté & Santé',
    slug: 'beaute-sante',
    status: 'active'
  },
  {
    id: 'cat-import',
    name: 'Produits Importés',
    slug: 'produits-importes',
    status: 'active'
  }
];

// Mock data for vendors
const mockVendors = [
  {
    id: 'vendor-1',
    name: 'Vendeur par défaut',
    slug: 'vendeur-defaut',
    email: 'default@laboutique.bj',
    status: 'active'
  },
  {
    id: 'vendor-import',
    name: 'Vendeur Import',
    slug: 'vendeur-import',
    email: 'import@laboutique.bj',
    status: 'active'
  }
];

// Create mock database file
const mockDb = {
  categories: mockCategories,
  vendors: mockVendors,
  products: []
};

// Write mock database to file
const mockDbPath = path.join(__dirname, '..', 'mock-db.json');
fs.writeFileSync(mockDbPath, JSON.stringify(mockDb, null, 2));

console.log('✅ Mock database created successfully!');
console.log(`📁 Location: ${mockDbPath}`);
console.log('📊 Data created:');
console.log(`   - ${mockCategories.length} categories`);
console.log(`   - ${mockVendors.length} vendors`);
console.log('   - 0 products (will be created during import)');

console.log('\n🔧 To use the mock database:');
console.log('1. The import API will automatically fallback to mock data');
console.log('2. Products will be saved to the mock database file');
console.log('3. You can view the data by opening mock-db.json');