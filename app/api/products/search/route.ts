import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressDropshipApiService, ProductSearchFilters } from '@/lib/services/aliexpress-dropship-api.service';

/**
 * POST /api/products/search
 * Recherche de produits AliExpress sans import (preview seulement)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des paramètres requis
    if (!body.keywords && !body.category_id) {
      return NextResponse.json(
        { error: 'Au moins keywords ou category_id est requis' },
        { status: 400 }
      );
    }

    // Construire les filtres de recherche
    const filters: ProductSearchFilters = {
      keywords: body.keywords || '',
      category_id: body.category_id,
      min_price: body.min_price,
      max_price: body.max_price,
      min_sale_price: body.min_sale_price,
      max_sale_price: body.max_sale_price,
      sort: body.sort || 'sales_desc',
      page_size: Math.min(body.limit || 50, 100), // Max 100
      page_no: 1,
      ship_to_country: 'BJ',
    };

    console.log('[Product Search] Starting search with filters:', filters);

    // Rechercher les produits via l'API AliExpress
    const apiService = getAliExpressDropshipApiService();
    const products = await apiService.searchProducts(filters);

    if (products.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun produit trouvé avec ces critères',
        products: [],
        total: 0,
      });
    }

    console.log(`[Product Search] Found ${products.length} products`);

    // Convertir les produits pour l'affichage
    const convertedProducts = products.map(product => {
      const converted = apiService.convertToScrapedProductData(
        product,
        product.product_detail_url
      );
      
      return {
        id: product.product_id,
        title: product.product_title,
        price: converted.price,
        original_price: converted.original_price,
        image: converted.images[0] || '',
        images: converted.images,
        source_url: product.product_detail_url,
        sku: converted.sku,
        rating: product.evaluate_rate,
        sales: product.lastest_volume,
        short_description: converted.short_description,
      };
    });

    return NextResponse.json({
      success: true,
      message: `${products.length} produits trouvés`,
      products: convertedProducts,
      total: products.length,
      filters: filters,
    });

  } catch (error) {
    console.error('[Product Search] Fatal error:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la recherche',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}