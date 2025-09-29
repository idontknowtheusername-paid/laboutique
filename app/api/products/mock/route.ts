import { NextRequest, NextResponse } from 'next/server';
import { MockDbService } from '@/lib/services/mock-db.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const sourcePlatform = searchParams.get('source_platform');
    
    console.log('[MOCK-API] Récupération des produits:', { limit, status, sourcePlatform });
    
    // Récupérer tous les produits de la mock DB
    const allProducts = MockDbService.getProducts();
    
    // Appliquer les filtres
    let filteredProducts = allProducts;
    
    if (status) {
      filteredProducts = filteredProducts.filter(p => p.status === status);
    }
    
    if (sourcePlatform) {
      // Gérer les valeurs multiples séparées par des virgules
      const platforms = sourcePlatform.split(',').map(p => p.trim());
      filteredProducts = filteredProducts.filter(p => 
        p.source_platform && platforms.includes(p.source_platform)
      );
    }
    
    // Limiter les résultats
    const limitedProducts = filteredProducts.slice(0, limit);
    
    // Enrichir avec les données des catégories et vendeurs
    const enrichedProducts = limitedProducts.map(product => {
      const category = MockDbService.getCategories().find(c => c.id === product.category_id);
      const vendor = MockDbService.getVendors().find(v => v.id === product.vendor_id);
      
      return {
        ...product,
        category: category ? {
          id: category.id,
          name: category.name,
          slug: category.slug
        } : null,
        vendor: vendor ? {
          id: vendor.id,
          name: vendor.name,
          slug: vendor.slug
        } : null
      };
    });
    
    console.log('[MOCK-API] ✅ Produits récupérés:', {
      total: allProducts.length,
      filtered: filteredProducts.length,
      returned: enrichedProducts.length
    });
    
    return NextResponse.json({
      success: true,
      data: enrichedProducts,
      pagination: {
        page: 1,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit),
        hasNext: false,
        hasPrev: false
      }
    });
    
  } catch (error) {
    console.error('[MOCK-API] ❌ Erreur:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la récupération des produits',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}