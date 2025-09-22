import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '@/lib/services/products.service';
import { ScrapingService } from '@/lib/services/scraping.service';
import { validateImportedProduct } from '@/lib/schemas/product-import.schema';
import { ScrapedProductData } from '@/lib/services/types';
import { supabase } from '@/lib/supabase';

// Fonction pour valider l'URL
function validateUrl(url: string): { valid: boolean; error?: string } {
  return ScrapingService.validateProductUrl(url);
}

export async function POST(request: NextRequest) {
  try {
    const { url, importDirectly = false, publishDirectly = false } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL requise' },
        { status: 400 }
      );
    }
    
    // Valider l'URL
    const validation = validateUrl(url);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Scraper les données
    const scrapedData = await ScrapingService.scrapeProduct(url);
    
    if (!scrapedData) {
      return NextResponse.json(
        { error: 'Impossible de récupérer les données du produit' },
        { status: 500 }
      );
    }

    // Valider les données avec notre schéma
    const validationResult = await validateImportedProduct(scrapedData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.error.issues.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const productData = validationResult.data;
    
    // Si import direct, créer le produit
    if (importDirectly) {
      try {
        // Récupérer une catégorie par défaut
        const { data: defaultCategory } = await (supabase as any)
          .from('categories')
          .select('id')
          .eq('status', 'active')
          .limit(1)
          .single();

        // Récupérer un vendeur par défaut ou en créer un
        let { data: defaultVendor } = await (supabase as any)
          .from('vendors')
          .select('id')
          .eq('status', 'active')
          .limit(1)
          .single();

        // Si aucun vendeur n'existe, créer un vendeur par défaut
        if (!defaultVendor) {
          const { data: newVendor, error: vendorError } = await (supabase as any)
            .from('vendors')
            .insert([{
              name: 'Import Automatique',
              slug: 'import-automatique',
              email: 'import@laboutique.bj',
              status: 'active',
              commission_rate: 10.00,
              rating: 0,
              total_reviews: 0,
              total_products: 0,
              total_orders: 0
            }])
            .select('id')
            .single();

          if (vendorError) {
            console.error('Error creating default vendor:', vendorError);
            return NextResponse.json(
              { error: 'Impossible de créer un vendeur par défaut' },
              { status: 500 }
            );
          }
          defaultVendor = newVendor;
        }

        const product = await ProductsService.create({
          name: productData.name,
          slug: productData.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
          description: productData.description,
          short_description: productData.short_description,
          price: productData.price,
          original_price: productData.original_price,
          images: productData.images,
          category_id: defaultCategory?.id || null,
          vendor_id: defaultVendor.id,
          sku: productData.sku || `IMPORT-${Date.now()}`,
          quantity: productData.stock_quantity || 0,
          track_quantity: true,
          status: publishDirectly ? 'active' : 'draft',
          featured: false,
          meta_title: `${productData.name} - La Boutique B`,
          meta_description: productData.short_description,
          specifications: productData.specifications,
          source_url: productData.source_url,
          source_platform: productData.source_platform
        });
        
        return NextResponse.json({
          success: true,
          product,
          message: 'Produit importé avec succès'
        });
      } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
          { error: 'Erreur lors de la création du produit' },
          { status: 500 }
        );
      }
    }
    
    // Retourner les données pour prévisualisation
    return NextResponse.json({
      success: true,
      data: productData,
      message: 'Données récupérées avec succès'
    });
    
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}