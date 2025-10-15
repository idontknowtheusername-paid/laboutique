import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseAdmin;
    const body = await request.json();
    
    const { name, description, parent_id, icon, color } = body;
    const categoryId = params.id;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Le nom de la catégorie est requis' },
        { status: 400 }
      );
    }

    // Vérifier que la catégorie existe
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    const { data: category, error } = await supabase
      .from('categories')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        parent_id: parent_id || null,
        icon: icon || '📁',
        color: color || 'bg-gray-100 text-gray-800',
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
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
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseAdmin;
    const categoryId = params.id;

    // Vérifier s'il y a des produits dans cette catégorie
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', categoryId)
      .limit(1);

    if (productsError) {
      console.error('Erreur lors de la vérification des produits:', productsError);
      return NextResponse.json(
        { success: false, error: productsError.message },
        { status: 500 }
      );
    }

    if (products && products.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Impossible de supprimer une catégorie qui contient des produits' },
        { status: 400 }
      );
    }

    // Vérifier s'il y a des sous-catégories
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', categoryId)
      .limit(1);

    if (subcategoriesError) {
      console.error('Erreur lors de la vérification des sous-catégories:', subcategoriesError);
      return NextResponse.json(
        { success: false, error: subcategoriesError.message },
        { status: 500 }
      );
    }

    if (subcategories && subcategories.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Impossible de supprimer une catégorie qui contient des sous-catégories' },
        { status: 400 }
      );
    }

    // Supprimer la catégorie
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (deleteError) {
      console.error('Erreur lors de la suppression de la catégorie:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}