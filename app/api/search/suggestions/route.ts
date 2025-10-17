// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          suggestions: [],
          trending: [],
          categories: []
        }
      });
    }

    const supabase = supabaseAdmin;

    // 1. Suggestions de produits (noms, marques)
    const { data: productSuggestions } = await supabase
      .from('products')
      .select('name, brand, category_id, categories(name)')
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
      .eq('status', 'active')
      .limit(limit);

    // 2. Suggestions de catégories
    const { data: categorySuggestions } = await supabase
      .from('categories')
      .select('name, slug')
      .ilike('name', `%${query}%`)
      .eq('status', 'active')
      .limit(5);

    // 3. Trending searches (basé sur les recherches populaires)
    // Pour l'instant, on utilise des suggestions statiques
    // TODO: Implémenter un système de tracking des recherches populaires
    const trendingSearches = [
      'Smartphone', 'Laptop', 'TV', 'Mode', 'Chaussures', 
      'Sac', 'Montre', 'Parfum', 'Électronique', 'Maison'
    ].filter(term => 
      term.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    // 4. Marques populaires
    const { data: brandSuggestions } = await supabase
      .from('products')
      .select('brand')
      .not('brand', 'is', null)
      .ilike('brand', `%${query}%`)
      .eq('status', 'active')
      .limit(5);

    // Formater les suggestions
    const suggestions = [
      ...productSuggestions?.map(p => ({
        type: 'product',
        text: p.name,
        category: p.categories?.name,
        brand: p.brand
      })) || [],
      ...categorySuggestions?.map(c => ({
        type: 'category',
        text: c.name,
        slug: c.slug
      })) || [],
      ...brandSuggestions?.map(b => ({
        type: 'brand',
        text: b.brand
      })) || []
    ].slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        trending: trendingSearches,
        categories: categorySuggestions || []
      }
    });

  } catch (error) {
    console.error('Erreur API suggestions:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des suggestions' },
      { status: 500 }
    );
  }
}