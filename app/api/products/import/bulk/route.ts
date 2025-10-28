import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressDropshipApiService, ProductSearchFilters } from '@/lib/services/aliexpress-dropship-api.service';
import { supabaseAdmin } from '@/lib/supabase-server';
import { findBestCategory, getDefaultCategory } from '@/lib/utils/category-matcher';

/**
 * POST /api/products/import/bulk
 * Import en masse de produits AliExpress par recherche/catégorie
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des paramètres requis
    if (!body.keywords && !body.category_id) {
      return NextResponse.json(
        { error: 'Au moins keywords ou category_id est requis' },
        { status: 400 }
      );
    }

    // Construire les filtres de recherche
    const filters: ProductSearchFilters = {
      keywords: body.keywords || '',
      category_id: body.category_id,
      min_price: body.min_price,
      max_price: body.max_price,
      min_sale_price: body.min_sale_price,
      max_sale_price: body.max_sale_price,
      sort: body.sort || 'sales_desc',
      page_size: Math.min(body.limit || 50, 100), // Max 100
      page_no: 1,
      ship_to_country: 'BJ',
    };

    console.log('[Bulk Import] Starting with filters:', filters);

    // Rechercher les produits via l'API AliExpress
    const apiService = getAliExpressDropshipApiService();
    const products = await apiService.searchProducts(filters);

    if (products.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun produit trouvé avec ces critères',
        results: {
          total_found: 0,
          imported: 0,
          failed: 0,
          errors: [],
        },
      });
    }

    console.log(`[Bulk Import] Found ${products.length} products, starting import...`);

    // Utiliser Supabase Admin pour les opérations serveur
    const supabase = supabaseAdmin as any;
    
    // Statistiques d'import
    const results = {
      total_found: products.length,
      imported: 0,
      failed: 0,
      errors: [] as string[],
      imported_products: [] as any[],
    };

    // Importer chaque produit
    for (const [index, product] of products.entries()) {
      try {
        console.log(`[Bulk Import] Processing product ${index + 1}/${products.length}: ${product.product_id}`);

        // Vérifier si le produit existe déjà (par SKU ou nom similaire)
        const { data: existingProducts } = await supabase
          .from('products')
          .select('id, name, sku')
          .or(`sku.eq.AE-DS-${product.product_id},name.ilike.%${product.product_title.slice(0, 50)}%`);

        if (existingProducts && existingProducts.length > 0) {
          const exactMatch = existingProducts.find((p: any) => p.sku === `AE-DS-${product.product_id}`);
          if (exactMatch) {
            console.log(`[Bulk Import] Product ${product.product_id} already exists (exact SKU match), skipping`);
            results.errors.push(`Produit ${product.product_id} déjà existant (SKU: ${exactMatch.sku})`);
            results.failed++;
            continue;
          }
          
          // Vérification de similarité de nom (optionnel, peut créer des faux positifs)
          const similarMatch = existingProducts.find((p: any) => 
            p.name && p.name.toLowerCase().includes(product.product_title.toLowerCase().slice(0, 30))
          );
          if (similarMatch && body.skip_similar) {
            console.log(`[Bulk Import] Similar product found: ${similarMatch.name}, skipping`);
            results.errors.push(`Produit similaire trouvé: "${similarMatch.name}"`);
            results.failed++;
            continue;
          }
        }

        // Convertir le produit au format de notre système
        const productData = apiService.convertToScrapedProductData(
          product,
          product.product_detail_url
        );

        // Matcher la catégorie
        const { data: categories } = await supabase
          .from('categories')
          .select('id, name, slug');
        
        const categoryId = categories && categories.length > 0 
          ? findBestCategory(productData.name, categories) || getDefaultCategory()
          : getDefaultCategory();

        // Insérer le produit dans la base de données
        const { data: insertedProduct, error: insertError } = await supabase
          .from('products')
          .insert({
            name: productData.name,
            description: productData.description,
            short_description: productData.short_description,
            price: productData.price,
            original_price: productData.original_price,
            sku: productData.sku,
            stock_quantity: productData.stock_quantity,
            category_id: categoryId,
            is_active: true,
            source_url: productData.source_url,
            source_platform: productData.source_platform,
            specifications: productData.specifications,
          })
          .select()
          .single();

        if (insertError) {
          console.error(`[Bulk Import] Failed to insert product ${product.product_id}:`, insertError);
          results.errors.push(`Erreur insertion ${product.product_id}: ${insertError.message}`);
          results.failed++;
          continue;
        }

        // Insérer les images
        if (productData.images.length > 0) {
          const imageInserts = productData.images.map((imageUrl, idx) => ({
            product_id: insertedProduct.id,
            image_url: imageUrl,
            alt_text: `${productData.name} - Image ${idx + 1}`,
            display_order: idx,
            is_primary: idx === 0,
          }));

          const { error: imageError } = await supabase
            .from('product_images')
            .insert(imageInserts);

          if (imageError) {
            console.error(`[Bulk Import] Failed to insert images for ${product.product_id}:`, imageError);
            // Ne pas faire échouer l'import pour les images
          }
        }

        results.imported++;
        results.imported_products.push({
          id: insertedProduct.id,
          name: insertedProduct.name,
          sku: insertedProduct.sku,
          price: insertedProduct.price,
        });

        console.log(`[Bulk Import] Successfully imported product ${product.product_id}`);

      } catch (error) {
        console.error(`[Bulk Import] Error processing product ${product.product_id}:`, error);
        results.errors.push(`Erreur ${product.product_id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        results.failed++;
      }
    }

    console.log(`[Bulk Import] Completed: ${results.imported}/${results.total_found} imported`);

    return NextResponse.json({
      success: true,
      message: `Import terminé: ${results.imported}/${results.total_found} produits importés`,
      results,
    });

  } catch (error) {
    console.error('[Bulk Import] Fatal error:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'import en masse',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}