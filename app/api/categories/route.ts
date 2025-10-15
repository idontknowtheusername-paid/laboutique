import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseAdmin;
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        description,
        parent_id,
        icon,
        color,
        created_at,
        updated_at,
        products:products(count)
      `)
      .order('name');

    if (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Transformer les données pour inclure le nombre de produits
    const categoriesWithCount = categories?.map(cat => ({
      ...cat,
      product_count: cat.products?.[0]?.count || 0
    })) || [];

    return NextResponse.json({
      success: true,
      data: categoriesWithCount
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin;
    const body = await request.json();
    
    const { name, description, parent_id, icon, color } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Le nom de la catégorie est requis' },
        { status: 400 }
      );
    }

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        parent_id: parent_id || null,
        icon: icon || '📁',
        color: color || 'bg-gray-100 text-gray-800'
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}