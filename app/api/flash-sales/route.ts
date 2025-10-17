// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = supabaseAdmin;

    // Récupérer les flash sales actives
    const { data: flashSales, error: flashSalesError } = await supabase
      .from('flash_sales')
      .select(`
        *,
        flash_sale_products (
          *,
          products (
            id, name, slug, images, brand, average_rating, quantity, status
          )
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (flashSalesError) {
      throw new Error(flashSalesError.message);
    }

    // Formater les données pour le frontend
    const formattedFlashSales = flashSales?.map(sale => {
      const now = new Date();
      const startDate = new Date(sale.start_date);
      const endDate = new Date(sale.end_date);
      
      // Calculer le temps restant
      const timeLeft = endDate.getTime() - now.getTime();
      const hours = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
      const minutes = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));
      const seconds = Math.max(0, Math.floor((timeLeft % (1000 * 60)) / 1000));

      return {
        ...sale,
        timeLeft: {
          hours,
          minutes,
          seconds,
          total: timeLeft
        },
        isActive: now >= startDate && now <= endDate,
        products: sale.flash_sale_products?.map(fsp => ({
          ...fsp,
          product: fsp.products
        })) || []
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: formattedFlashSales
    });

  } catch (error) {
    console.error('Erreur API flash sales:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des ventes flash' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, start_date, end_date, products } = body;

    // Validation
    if (!name || !start_date || !end_date || !products || products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // Créer la flash sale
    const { data: flashSale, error: flashSaleError } = await supabase
      .from('flash_sales')
      .insert({
        name,
        description,
        start_date,
        end_date,
        status: 'scheduled'
      })
      .select()
      .single();

    if (flashSaleError) {
      throw new Error(flashSaleError.message);
    }

    // Ajouter les produits
    const flashSaleProducts = products.map((product: any, index: number) => ({
      flash_sale_id: flashSale.id,
      product_id: product.product_id,
      flash_price: product.flash_price,
      original_price: product.original_price,
      discount_percentage: product.discount_percentage,
      max_quantity: product.max_quantity || null,
      sort_order: index
    }));

    const { error: productsError } = await supabase
      .from('flash_sale_products')
      .insert(flashSaleProducts);

    if (productsError) {
      throw new Error(productsError.message);
    }

    return NextResponse.json({
      success: true,
      data: flashSale
    });

  } catch (error) {
    console.error('Erreur création flash sale:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la vente flash' },
      { status: 500 }
    );
  }
}