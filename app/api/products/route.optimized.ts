import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '@/lib/services/products.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let products;
    
    if (search) {
      products = await ProductsService.search(search, { limit });
    } else if (category) {
      products = await ProductsService.getByCategory(category, { limit });
    } else {
      products = await ProductsService.getPopular(limit);
    }

    return NextResponse.json({
      success: true,
      data: products.data,
      cached: false
    });

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}