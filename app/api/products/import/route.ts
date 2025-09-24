import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '@/lib/services/products.service';
import { ScrapingService } from '@/lib/services/scraping.service';
import { validateImportedProduct } from '@/lib/schemas/product-import.schema';
import { ScrapedProductData } from '@/lib/services/types';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-server';
import { findBestCategory, getDefaultCategory, findBestCategoryByKeywords } from '@/lib/utils/category-matcher';

// Ensure Node.js runtime so server-only env vars (service role) are available
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
        const db = (isSupabaseAdminConfigured() ? supabaseAdmin : supabase) as any;
        // Récupérer toutes les catégories disponibles (tolérant aux erreurs)
        let availableCategories: any[] = [];
        try {
          const { data: cats, error: categoriesError } = await db
            .from('categories')
            .select('id, name, slug')
            .eq('status', 'active');
          if (categoriesError) {
            console.warn('[IMPORT] Catégories non disponibles, on appliquera la catégorie par défaut. Détails:', categoriesError);
          } else {
            availableCategories = cats || [];
          }
        } catch (e) {
          console.warn('[IMPORT] Exception lors de la récupération des catégories, fallback par défaut:', e);
        }

        // Trouver la meilleure catégorie basée sur le nom du produit
        let selectedCategoryId = findBestCategory(productData.name, availableCategories || [])
          || findBestCategoryByKeywords(productData.name, availableCategories || []);
        console.log('[IMPORT] Catégorie trouvée:', selectedCategoryId);
        // Si aucune catégorie n'est trouvée, utiliser une catégorie par défaut (UUID explicite)
        if (!selectedCategoryId) {
          selectedCategoryId = 'c1011f0a-a196-4678-934a-85ae8b9cff35'; // Catégorie "Électronique" par défaut
          console.log('[IMPORT] Catégorie par défaut forcée (UUID):', selectedCategoryId);
        }

        // Récupérer ou créer un vendeur par défaut
        const defaultVendorSlug = 'laboutique-import';
        let defaultVendor: { id: string } | null = null;

        // 1. Tenter de trouver un vendeur existant par slug
        const { data: existingVendor, error: fetchVendorError } = await db
          .from('vendors')
          .select('id')
          .eq('slug', defaultVendorSlug)
          .limit(1)
          .single();

        if (fetchVendorError && fetchVendorError.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error('Error fetching existing vendor:', fetchVendorError);
          // Continue, try to create
        }

        if (existingVendor) {
          defaultVendor = existingVendor;
          console.log('[IMPORT] Vendeur existant trouvé:', defaultVendor.id);
        } else {
          // 2. Si non trouvé, tenter de créer un nouveau vendeur
          const { data: newVendor, error: createVendorError } = await db
            .from('vendors')
            .insert([{
              name: 'La Boutique B Import',
              slug: defaultVendorSlug,
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

          if (createVendorError) {
            console.error('Error creating default vendor:', createVendorError);
            // If creation fails, try to fetch again in case of race condition or external creation
            const { data: retryVendor, error: retryFetchError } = await db
              .from('vendors')
              .select('id')
              .eq('slug', defaultVendorSlug)
              .limit(1)
              .single();

            if (retryVendor) {
              defaultVendor = retryVendor;
              console.log('[IMPORT] Vendeur trouvé après échec de création (race condition):', defaultVendor.id);
            } else {
              return NextResponse.json(
                { error: 'Impossible de créer un vendeur par défaut', details: createVendorError.message },
                { status: 500 }
              );
            }
          } else {
            defaultVendor = newVendor;
            console.log('[IMPORT] Vendeur par défaut créé:', defaultVendor?.id);
          }
        }

        if (!defaultVendor) {
          return NextResponse.json(
            { error: 'Aucun vendeur par défaut disponible ou créable' },
            { status: 500 }
          );
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
        const creationResponse = await ProductsService.createWithClient(db, productPayload);

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