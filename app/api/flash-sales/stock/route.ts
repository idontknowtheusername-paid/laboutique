// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flashSaleId = searchParams.get('flash_sale_id');
    const productId = searchParams.get('product_id');

    if (!flashSaleId) {
      return NextResponse.json(
        { success: false, error: 'flash_sale_id requis' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    let query = supabase
      .from('flash_sale_products')
      .select(`
        *,
        products (id, name, quantity, status)
      `)
      .eq('flash_sale_id', flashSaleId);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data: flashSaleProducts, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Calculer les stocks disponibles
    const stockInfo = flashSaleProducts?.map(fsp => {
      const product = fsp.products;
      const availableStock = Math.min(
        product?.quantity || 0,
        fsp.max_quantity ? fsp.max_quantity - fsp.sold_quantity : Infinity
      );

      return {
        flash_sale_product_id: fsp.id,
        product_id: fsp.product_id,
        product_name: product?.name,
        flash_price: fsp.flash_price,
        original_price: fsp.original_price,
        discount_percentage: fsp.discount_percentage,
        max_quantity: fsp.max_quantity,
        sold_quantity: fsp.sold_quantity,
        available_stock: availableStock,
        is_available: availableStock > 0 && product?.status === 'active',
        stock_percentage: fsp.max_quantity 
          ? Math.round((fsp.sold_quantity / fsp.max_quantity) * 100)
          : 0
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: stockInfo
    });

  } catch (error) {
    console.error('Erreur API stock flash sales:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du stock' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flash_sale_product_id, quantity } = body;

    if (!flash_sale_product_id || !quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Données invalides' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // Vérifier le stock disponible
    const { data: flashSaleProduct, error: fetchError } = await supabase
      .from('flash_sale_products')
      .select(`
        *,
        products (quantity, status)
      `)
      .eq('id', flash_sale_product_id)
      .single();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    const product = flashSaleProduct.products;
    const availableStock = Math.min(
      product?.quantity || 0,
      flashSaleProduct.max_quantity 
        ? flashSaleProduct.max_quantity - flashSaleProduct.sold_quantity 
        : Infinity
    );

    if (quantity > availableStock) {
      return NextResponse.json(
        { success: false, error: 'Stock insuffisant' },
        { status: 400 }
      );
    }

    // Mettre à jour le stock vendu
    const { error: updateError } = await supabase
      .from('flash_sale_products')
      .update({
        sold_quantity: flashSaleProduct.sold_quantity + quantity
      })
      .eq('id', flash_sale_product_id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Mettre à jour le stock du produit
    const { error: productUpdateError } = await supabase
      .from('products')
      .update({
        quantity: (product?.quantity || 0) - quantity
      })
      .eq('id', flashSaleProduct.product_id);

    if (productUpdateError) {
      console.warn('Erreur mise à jour stock produit:', productUpdateError);
    }

    return NextResponse.json({
      success: true,
      data: {
        sold_quantity: flashSaleProduct.sold_quantity + quantity,
        available_stock: availableStock - quantity
      }
    });

  } catch (error) {
    console.error('Erreur mise à jour stock:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du stock' },
      { status: 500 }
    );
  }
}