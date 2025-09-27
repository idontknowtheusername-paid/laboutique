import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    console.log('[DB-TEST] Testing database connection and tables...');
    
    // Test categories table
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug, status')
      .limit(5);
    
    console.log('[DB-TEST] Categories result:', { 
      count: categories?.length || 0, 
      error: categoriesError?.message || null,
      data: categories 
    });
    
    // Test vendors table
    const { data: vendors, error: vendorsError } = await supabaseAdmin
      .from('vendors')
      .select('id, name, slug, status')
      .limit(5);
    
    console.log('[DB-TEST] Vendors result:', { 
      count: vendors?.length || 0, 
      error: vendorsError?.message || null,
      data: vendors 
    });
    
    // Test products table
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, category_id, vendor_id, status')
      .limit(5);
    
    console.log('[DB-TEST] Products result:', { 
      count: products?.length || 0, 
      error: productsError?.message || null,
      data: products 
    });
    
    return NextResponse.json({
      success: true,
      data: {
        categories: {
          count: categories?.length || 0,
          error: categoriesError?.message || null,
          sample: categories?.slice(0, 2) || []
        },
        vendors: {
          count: vendors?.length || 0,
          error: vendorsError?.message || null,
          sample: vendors?.slice(0, 2) || []
        },
        products: {
          count: products?.length || 0,
          error: productsError?.message || null,
          sample: products?.slice(0, 2) || []
        }
      }
    });
    
  } catch (error) {
    console.error('[DB-TEST] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}