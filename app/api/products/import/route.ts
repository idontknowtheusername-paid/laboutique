import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '@/lib/services/products.service';
import { ScrapingService } from '@/lib/services/scraping.service';
import { validateImportedProduct } from '@/lib/schemas/product-import.schema';
import { ScrapedProductData } from '@/lib/services/types';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-server';
import { findBestCategory, getDefaultCategory } from '@/lib/utils/category-matcher';

// Fonction pour valider l'URL
function validateUrl(url: string): { valid: boolean; error?: string } {
  return ScrapingService.validateProductUrl(url);
}

export async function POST(request: NextRequest) {
  try {
    const { url, importDirectly = false, publishDirectly = false } = await request.json();
    console.log('[IMPORT] Params:', { url, importDirectly, publishDirectly });
    
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
    
    // Scraper les données (simulation, aucune API key nécessaire)
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
          details: validationResult.errors?.issues.map((err: any) => ({
            path: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const productData = validationResult.data;
    
    if (!productData) {
      return NextResponse.json(
        { error: 'Données de produit manquantes' },
        { status: 400 }
      );
    }
    
    // Si import direct, créer le produit
    if (importDirectly) {
      try {
        console.log('[IMPORT] Import direct activé');
        // Récupérer toutes les catégories disponibles
        const { data: availableCategories, error: categoriesError } = await (supabase as any)
          .from('categories')
          .select('id, name, slug')
          .eq('status', 'active');

        console.log('[IMPORT] Catégories actives récupérées:', availableCategories);

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          return NextResponse.json(
            { error: 'Impossible de récupérer les catégories' },
            { status: 500 }
          );
        }

        // Trouver la meilleure catégorie basée sur le nom du produit
        let selectedCategoryId = findBestCategory(productData.name, availableCategories || []);
        console.log('[IMPORT] Catégorie trouvée:', selectedCategoryId);
        // Si aucune catégorie n'est trouvée, utiliser une catégorie par défaut (UUID explicite)
        if (!selectedCategoryId) {
          selectedCategoryId = 'c1011f0a-a196-4678-934a-85ae8b9cff35'; // Catégorie "Électronique" par défaut
          console.log('[IMPORT] Catégorie par défaut forcée (UUID):', selectedCategoryId);
        }

        // Récupérer un vendeur par défaut ou en créer un
        let { data: defaultVendor } = await (supabase as any)
          .from('vendors')
          .select('id')
          .eq('status', 'active')
          .eq('id', '8f1010fb-e4e1-448a-bb4b-8d320a2aa9e6') // Vendeur "TechStore Bénin" par défaut
          .single();
        console.log('[IMPORT] Vendeur trouvé:', defaultVendor?.id);
        // Si aucun vendeur trouvé, fallback sur le premier actif
        if (!defaultVendor) {
          const { data: firstVendor } = await (supabase as any)
            .from('vendors')
            .select('id')
            .eq('status', 'active')
            .limit(1)
            .single();
          defaultVendor = firstVendor;
          console.log('[IMPORT] Fallback: premier vendeur actif utilisé:', defaultVendor?.id);
        }
        // Si toujours rien, créer un vendeur par défaut
        if (!defaultVendor) {
          const { data: newVendor, error: vendorError } = await (supabase as any)
            .from('vendors')
            .insert([{
              name: 'La Boutique B Import',
              slug: 'laboutique-import',
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
          console.log('[IMPORT] Vendeur par défaut créé:', defaultVendor?.id);
        }

        // Si aucun vendeur n'existe, créer un vendeur par défaut
        if (!defaultVendor) {
          const { data: newVendor, error: vendorError } = await (supabase as any)
            .from('vendors')
            .insert([{
              name: 'La Boutique B Import',
              slug: 'laboutique-import',
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
          console.log('[IMPORT] Vendeur par défaut créé:', defaultVendor?.id);
        }

        // Corriger les images pour Next.js : préfixer par '/' si ce sont des fichiers locaux

        const fixedImages = (productData.images || []).map((img: string) => {
          if (!img) return '';
          if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) return img;
          return '/' + img;
        });

        // On force le statut à 'active' quoi qu'il arrive
        const productPayload = {
          name: productData.name,
          slug: productData.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
          description: productData.description,
          short_description: productData.short_description,
          price: productData.price,
          // Mapper le prix original en compare_price pour la base de données
          compare_price: productData.original_price,
          images: fixedImages,
          category_id: selectedCategoryId,
          vendor_id: defaultVendor.id,
          sku: productData.sku || `IMPORT-${Date.now()}`,
          quantity: productData.stock_quantity || 0,
          track_quantity: true,
          status: 'active' as 'active', // On force ici et on cast pour TS
          featured: false,
          meta_title: `${productData.name} - La Boutique B`,
          meta_description: productData.short_description,
          source_url: productData.source_url,
          source_platform: productData.source_platform
        };
        console.log('[IMPORT] Payload envoyé à ProductsService.create:', productPayload);
        // Use admin client to bypass RLS for server-side import when configured
        const clientForInsert = isSupabaseAdminConfigured() ? supabaseAdmin : (supabase as any);
        const creationResponse = await ProductsService.createWithClient(clientForInsert, productPayload);

        if (!creationResponse.success || !creationResponse.data) {
          const errMsg = creationResponse.error || 'Erreur lors de la création du produit';
          console.error('Error creating product:', errMsg);
          return NextResponse.json(
            { error: errMsg },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: creationResponse.data,
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