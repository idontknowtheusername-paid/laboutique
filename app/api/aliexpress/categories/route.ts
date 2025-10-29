import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressDropshipApiService } from '@/lib/services/aliexpress-dropship-api.service';

export async function GET() {
  try {
    console.log('[Categories API] Fetching AliExpress categories...');
    
    const apiService = getAliExpressDropshipApiService();
    
    // Récupérer les catégories via l'API AliExpress
    const response = await (apiService as any).callApi('aliexpress.ds.category.get', {});
    
    console.log('[Categories API] Raw response:', JSON.stringify(response, null, 2));
    
    if (response?.aliexpress_ds_category_get_response?.resp_result) {
      const categories = response.aliexpress_ds_category_get_response.resp_result;
      
      // Filtrer les catégories principales
      const mainCategories = categories.filter((cat: any) => 
        !cat.parent_category_id || 
        ['200000343', '200000345', '509', '44', '1420', '21'].includes(cat.category_id)
      ).slice(0, 25);
      
      console.log('[Categories API] Filtered categories:', mainCategories.length);
      
      return NextResponse.json({
        success: true,
        categories: mainCategories,
        total: mainCategories.length
      });
    }
    
    // Si l'API ne fonctionne pas, retourner des catégories par défaut
    const defaultCategories = [
      { category_id: '200000343', category_name: 'Electronics & Accessories' },
      { category_id: '200000345', category_name: 'Women\'s Fashion' },
      { category_id: '509', category_name: 'Home & Garden' },
      { category_id: '44', category_name: 'Sports & Entertainment' },
      { category_id: '1420', category_name: 'Health & Beauty' },
      { category_id: '21', category_name: 'Automotive & Motorcycles' },
      { category_id: '1501', category_name: 'Jewelry & Accessories' },
      { category_id: '200001996', category_name: 'Toys & Hobbies' },
      { category_id: '200001075', category_name: 'Tools & Hardware' },
      { category_id: '200000532', category_name: 'Luggage & Bags' },
      { category_id: '200000297', category_name: 'Men\'s Fashion' },
      { category_id: '200000298', category_name: 'Shoes' },
      { category_id: '200000299', category_name: 'Watches' },
      { category_id: '200000300', category_name: 'Computer & Office' },
      { category_id: '200000301', category_name: 'Consumer Electronics' }
    ];
    
    console.log('[Categories API] Using default categories');
    
    return NextResponse.json({
      success: true,
      categories: defaultCategories,
      total: defaultCategories.length,
      source: 'default'
    });
    
  } catch (error) {
    console.error('[Categories API] Error:', error);
    
    // En cas d'erreur, retourner des catégories par défaut
    const fallbackCategories = [
      { category_id: '200000343', category_name: 'Electronics' },
      { category_id: '200000345', category_name: 'Fashion' },
      { category_id: '509', category_name: 'Home & Garden' },
      { category_id: '44', category_name: 'Sports' },
      { category_id: '1420', category_name: 'Beauty' }
    ];
    
    return NextResponse.json({
      success: true,
      categories: fallbackCategories,
      total: fallbackCategories.length,
      source: 'fallback'
    });
  }
}