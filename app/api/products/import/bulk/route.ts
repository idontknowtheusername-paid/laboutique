import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressDropshipApiService, ProductSearchFilters } from '@/lib/services/aliexpress-dropship-api.service';
import { supabaseAdmin } from '@/lib/supabase-server';
import { findBestCategory, getDefaultCategory } from '@/lib/utils/category-matcher';
import { analyzeProductName, improveCategorization, enrichProductDescription, generateSEOKeywords } from '@/lib/utils/product-tagger';

/**
 * POST /api/products/import/bulk
 * Import en masse de produits AliExpress par recherche/catégorie
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation des paramètres requis
    if (!body.feed_type) {
      return NextResponse.json(
        { error: 'feed_type est requis' },
        { status: 400 }
      );
    }

    // Valider le feed_type
    const validFeeds = ['mixed', 'ds-bestselling', 'ds-new-arrival', 'ds-promotion', 'ds-choice'];
    if (!validFeeds.includes(body.feed_type)) {
      return NextResponse.json(
        { error: `feed_type invalide. Valeurs acceptées: ${validFeeds.join(', ')}` },
        { status: 400 }
      );
    }

    const limit = Math.min(body.limit || 50, 100); // Max 100

    console.log(`[Bulk Import] Starting with feed_type: ${body.feed_type}, limit: ${limit}`);

    // Rechercher les produits via l'API AliExpress
    const apiService = getAliExpressDropshipApiService();
    let products;

    if (body.feed_type === 'mixed') {
      // Utiliser les feeds multiples pour récupérer des produits variés
      products = await apiService.getProductsFromMultipleFeeds(limit, 1);
    } else {
      // Utiliser un feed spécifique
      const response = await (apiService as any).callApi('aliexpress.ds.recommend.feed.get', {
        feed_name: body.feed_type,
        target_currency: 'USD',
        target_language: 'FR',
        ship_to_country: 'BJ',
        page_no: 1,
        page_size: limit,
      });

      if (response.aliexpress_ds_recommend_feed_get_response) {
        const result = response.aliexpress_ds_recommend_feed_get_response.result;
        if (result && result.products && result.products.product) {
          const rawProducts = result.products.product;
          products = rawProducts.map((item: any) => ({
            product_id: item.product_id || item.productId || '',
            product_title: item.product_title || item.subject || 'Produit sans nom',
            product_main_image_url: item.product_main_image_url || item.productMainImageUrl || '',
            product_video_url: item.product_video_url || item.productVideoUrl,
            product_small_image_urls: item.product_small_image_urls
              ? (typeof item.product_small_image_urls === 'string'
                ? item.product_small_image_urls.split(';')
                : item.product_small_image_urls)
              : [],
            sale_price: item.sale_price || item.salePrice || item.target_sale_price || '0',
            original_price: item.original_price || item.originalPrice || item.target_original_price,
            product_detail_url: item.product_detail_url || item.productDetailUrl || `https://www.aliexpress.com/item/${item.product_id}.html`,
            evaluate_rate: item.evaluate_rate || item.evaluateRate || '4.5',
            lastest_volume: item.lastest_volume || item.volume || 0,
          }));
        } else {
          products = [];
        }
      } else {
        products = [];
      }
    }

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

        // Analyser le produit avec le système de tags
        const taggingResult = analyzeProductName(productData.name, body.feed_type);
        console.log(`[Bulk Import] Tags for ${product.product_id}:`, taggingResult.tags.slice(0, 3));

        // Matcher la catégorie avec amélioration intelligente
        const { data: categories } = await supabase
          .from('categories')
          .select('id, name, slug');

        let categoryId = getDefaultCategory();
        if (categories && categories.length > 0) {
          // Utiliser d'abord le système de tags intelligent
          const improvedCategoryId = improveCategorization(
            productData.name,
            null,
            categories,
            body.feed_type
          );

          // Fallback sur l'ancien système si pas de résultat
          categoryId = improvedCategoryId ||
            findBestCategory(productData.name, categories) ||
            getDefaultCategory();
        }

        // Enrichir la description avec les tags
        const enrichedDescription = enrichProductDescription(
          productData.description,
          taggingResult.tags,
          body.feed_type
        );

        // Générer des mots-clés SEO
        const seoKeywords = generateSEOKeywords(taggingResult.tags);

        // Préparer les spécifications enrichies
        const enrichedSpecifications = {
          ...productData.specifications,
          'Tags': taggingResult.tags.slice(0, 5).map(t => t.name).join(', '),
          'Feed Type': body.feed_type,
          'Catégorie suggérée': taggingResult.suggestedCategory || 'Non déterminée',
          'Confiance': `${Math.round(taggingResult.confidence * 100)}%`,
          'Mots-clés SEO': seoKeywords.join(', ')
        };

        // Insérer le produit dans la base de données avec enrichissements
        const { data: insertedProduct, error: insertError } = await supabase
          .from('products')
          .insert({
            name: productData.name,
            description: enrichedDescription,
            short_description: productData.short_description,
            price: productData.price,
            original_price: productData.original_price,
            sku: productData.sku,
            stock_quantity: productData.stock_quantity,
            category_id: categoryId,
            is_active: true,
            source_url: productData.source_url,
            source_platform: productData.source_platform,
            specifications: enrichedSpecifications,
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
      message: `Import terminé: ${results.imported}/${results.total_found} produits importés depuis le feed ${body.feed_type}`,
      results,
      feed_type: body.feed_type,
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