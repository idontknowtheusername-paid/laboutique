// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// Fonction de typo-tolerance simple
function calculateLevenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Fonction de recherche avec typo-tolerance
function findSimilarTerms(query: string, terms: string[], maxDistance: number = 2): string[] {
  return terms
    .map(term => ({
      term,
      distance: calculateLevenshteinDistance(query.toLowerCase(), term.toLowerCase())
    }))
    .filter(({ distance }) => distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .map(({ term }) => term);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const inStock = searchParams.get('in_stock') === 'true';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          products: [],
          suggestions: [],
          didYouMean: null,
          pagination: {
            page: 1,
            limit,
            total: 0,
            hasNext: false
          }
        }
      });
    }

    const supabase = supabaseAdmin;
    const offset = (page - 1) * limit;

    // Construction de la requête de base
    let dbQuery = supabase
      .from('products')
      .select(`
        *,
        categories (name, slug),
        vendors (name, logo_url)
      `)
      .eq('status', 'active');

    // Recherche principale avec typo-tolerance
    const searchTerms = query.split(' ').filter(term => term.length > 0);
    
    if (searchTerms.length > 0) {
      // Recherche exacte d'abord
      const exactSearch = searchTerms.map(term => 
        `name.ilike.%${term}%,description.ilike.%${term}%,brand.ilike.%${term}%`
      ).join(',');
      
      dbQuery = dbQuery.or(exactSearch);
    }

    // Filtres
    if (category) {
      dbQuery = dbQuery.eq('category_id', category);
    }
    
    if (minPrice) {
      dbQuery = dbQuery.gte('price', parseFloat(minPrice));
    }
    
    if (maxPrice) {
      dbQuery = dbQuery.lte('price', parseFloat(maxPrice));
    }
    
    if (inStock) {
      dbQuery = dbQuery.gt('quantity', 0);
    }

    // Tri
    dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data: products, error, count } = await dbQuery;

    if (error) {
      throw new Error(error.message);
    }

    // Si pas de résultats, essayer la recherche avec typo-tolerance
    let didYouMean = null;
    if (!products || products.length === 0) {
      // Récupérer tous les noms de produits pour la typo-tolerance
      const { data: allProducts } = await supabase
        .from('products')
        .select('name, brand')
        .eq('status', 'active')
        .limit(1000);

      if (allProducts) {
        const allTerms = [
          ...allProducts.map(p => p.name),
          ...allProducts.map(p => p.brand).filter(Boolean)
        ];
        
        const similarTerms = findSimilarTerms(query, allTerms, 2);
        if (similarTerms.length > 0) {
          didYouMean = similarTerms[0];
        }
      }
    }

    // Suggestions de recherche alternatives
    const { data: suggestions } = await supabase
      .from('products')
      .select('name, brand')
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
      .eq('status', 'active')
      .limit(5);

    const totalCount = count || 0;
    const hasNext = offset + limit < totalCount;

    return NextResponse.json({
      success: true,
      data: {
        products: products || [],
        suggestions: suggestions?.map(s => s.name) || [],
        didYouMean,
        pagination: {
          page,
          limit,
          total: totalCount,
          hasNext
        }
      }
    });

  } catch (error) {
    console.error('Erreur API recherche avancée:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
}