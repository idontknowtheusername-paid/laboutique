import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/api/rate-limiter';
import { createOptimizedResponse } from '@/lib/api/response-optimizer';
import { ProductsServiceOptimized } from '@/lib/services/products.service.optimized';

export async function GET(request: NextRequest) {
  // Appliquer le rate limiting
  const rateLimitResponse = await applyRateLimit(request, 'products');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let products;
    
    if (search) {
      products = await ProductsServiceOptimized.search(search, { limit });
    } else if (category) {
      products = await ProductsServiceOptimized.getByCategory(category, { limit });
    } else {
      products = await ProductsServiceOptimized.getPopular(limit);
    }

    return await createOptimizedResponse(request, {
      success: true,
      data: products,
      cached: products.cached || false
    });

  } catch (error) {
    console.error('Products API error:', error);
    return await createOptimizedResponse(request, {
      success: false,
      error: 'Internal server error'
    }, 500);
  }
}