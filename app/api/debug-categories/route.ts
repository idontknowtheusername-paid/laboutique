import { NextResponse } from 'next/server';
import { CategoriesService } from '@/lib/services';

export async function GET() {
  try {
    console.log('🔍 Debug - Récupération des catégories');
    
    const result = await CategoriesService.getAll();
    
    console.log('🔍 Debug - Résultat:', {
      success: result.success,
      count: result.data?.length || 0,
      error: result.error
    });

    if (result.success && result.data) {
      const categories = result.data.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parent_id: cat.parent_id
      }));

      console.log('🔍 Debug - Catégories trouvées:', categories);

      return NextResponse.json({
        success: true,
        count: categories.length,
        categories
      });
    }

    return NextResponse.json({
      success: false,
      error: result.error
    });
  } catch (error) {
    console.error('🔍 Debug - Erreur:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}