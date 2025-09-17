import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';
    const sort = searchParams.get('sort');

    // Build filters
    const filters: any = {};
    if (category) filters.category_slug = category;
    if (search) filters.search = search;
    if (featured) filters.featured = true;

    // Build sort options
    const sortOptions: any = { field: 'created_at', direction: 'desc' };
    if (sort === 'price_asc') {
      sortOptions.field = 'price';
      sortOptions.direction = 'asc';
    } else if (sort === 'price_desc') {
      sortOptions.field = 'price';
      sortOptions.direction = 'desc';
    } else if (sort === 'name') {
      sortOptions.field = 'name';
      sortOptions.direction = 'asc';
    } else if (sort === 'newest') {
      sortOptions.field = 'created_at';
      sortOptions.direction = 'desc';
    }

    // Call the service
    const result = await ProductsService.getAll(
      filters,
      { page, limit },
      sortOptions
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch products' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // This would typically require authentication and admin privileges
    const result = await ProductsService.create(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create product' },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Products POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}