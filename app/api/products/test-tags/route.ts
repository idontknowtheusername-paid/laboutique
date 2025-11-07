import { NextRequest, NextResponse } from 'next/server';
import { analyzeProductName, improveCategorization } from '@/lib/utils/product-tagger';

/**
 * POST /api/products/test-tags
 * Teste le système de tags sur un nom de produit
 */
export async function POST(request: NextRequest) {
  try {
    const { product_name, feed_type } = await request.json();

    if (!product_name) {
      return NextResponse.json({
        success: false,
        error: 'product_name est requis'
      }, { status: 400 });
    }

    // Analyser le produit
    const taggingResult = analyzeProductName(product_name, feed_type);

    // Catégories de test (simulées)
    const mockCategories = [
      { id: '1', name: 'Électronique', slug: 'electronique' },
      { id: '2', name: 'Mode & Accessoires', slug: 'mode-accessoires' },
      { id: '3', name: 'Maison & Jardin', slug: 'maison-jardin' },
      { id: '4', name: 'Vêtements', slug: 'vetements' },
      { id: '5', name: 'Beauté & Santé', slug: 'beaute-sante' },
      { id: '6', name: 'Sport & Loisirs', slug: 'sport-loisirs' },
      { id: '7', name: 'Auto & Moto', slug: 'auto-moto' }
    ];

    // Tester l'amélioration de catégorisation
    const improvedCategory = improveCategorization(
      product_name,
      null,
      mockCategories,
      feed_type
    );

    const selectedCategory = mockCategories.find(cat => cat.id === improvedCategory);

    return NextResponse.json({
      success: true,
      product_name,
      feed_type: feed_type || 'none',
      analysis: {
        tags: taggingResult.tags,
        suggested_category: taggingResult.suggestedCategory,
        confidence: taggingResult.confidence,
        selected_category: selectedCategory || null
      },
      summary: {
        total_tags: taggingResult.tags.length,
        high_confidence_tags: taggingResult.tags.filter(t => t.confidence > 0.5).length,
        category_tags: taggingResult.tags.filter(t => t.category === 'product_category').length,
        material_tags: taggingResult.tags.filter(t => t.category === 'material').length,
        color_tags: taggingResult.tags.filter(t => t.category === 'color').length,
        brand_tags: taggingResult.tags.filter(t => t.category === 'brand').length
      }
    });

  } catch (error) {
    console.error('[Test Tags] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du test des tags'
    }, { status: 500 });
  }
}