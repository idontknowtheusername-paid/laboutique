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
    // Scraper les données
    console.log('[IMPORT] 🕷️ Début du scraping pour:', url);
    const scrapedData = await ScrapingService.scrapeProduct(url);
    console.log('[IMPORT] 📊 Données scrapées:', scrapedData ? {
      name: scrapedData.name,
      price: scrapedData.price,
      original_price: scrapedData.original_price,
      source_platform: scrapedData.source_platform,
      imagesCount: scrapedData.images?.length || 0
    } : null);
    
    if (!scrapedData) {
      console.error('[IMPORT] ❌ Aucune donnée scrapée');
      return NextResponse.json(
        { error: 'Impossible de récupérer les données du produit' },
        { status: 500 }
      );
    }

    // Valider les données avec notre schéma
    console.log('[IMPORT] ✅ Validation des données scrapées...');
    const validationResult = await validateImportedProduct(scrapedData);
    console.log('[IMPORT] 📊 Résultat validation:', {
      success: validationResult.success,
      hasData: !!validationResult.data,
      errorsCount: validationResult.errors?.issues?.length || 0
    });

    if (!validationResult.success) {
      console.error('[IMPORT] ❌ Validation échouée:', validationResult.errors?.issues);
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
    console.log('[IMPORT] ✅ Données validées:', {
      name: productData?.name,
      price: productData?.price,
      platform: productData?.source_platform
    });
    
    if (!productData) {
      console.error('[IMPORT] ❌ Données de produit manquantes après validation');
      return NextResponse.json(
        { error: 'Données de produit manquantes' },
        { status: 400 }
      );
    }
    
    // Si import direct, créer le produit
    if (importDirectly) {
      try {
        console.log('[IMPORT] Import direct activé');
        console.log('[IMPORT] Supabase admin configured:', isSupabaseAdminConfigured());
        console.log('[IMPORT] SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
        console.log('[IMPORT] SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
        
        // Force use of admin client for server-side operations
        const db = supabaseAdmin;
        // Récupérer toutes les catégories disponibles (tolérant aux erreurs)
        console.log('[IMPORT] 🏷️ Récupération des catégories...');
        let availableCategories: any[] = [];
        try {
          const { data: cats, error: categoriesError } = await db
            .from('categories')
            .select('id, name, slug')
            .eq('status', 'active');
          
          console.log('[IMPORT] 📊 Résultat récupération catégories:', { 
            catsCount: cats?.length || 0, 
            categoriesError: categoriesError ? {
              code: categoriesError.code,
              message: categoriesError.message,
              details: categoriesError.details
            } : null
          });
          
          if (categoriesError) {
            console.warn('[IMPORT] ⚠️ Catégories non disponibles, on appliquera la catégorie par défaut. Détails:', categoriesError);
          } else {
            availableCategories = cats || [];
            console.log('[IMPORT] ✅ Catégories récupérées:', availableCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug })));
          }
        } catch (e) {
          console.warn('[IMPORT] 💥 Exception lors de la récupération des catégories, fallback par défaut:', e);
        }

        // Trouver la meilleure catégorie basée sur le nom du produit
        console.log('[IMPORT] 🎯 Recherche de la meilleure catégorie pour:', productData.name);
        let selectedCategoryId = findBestCategory(productData.name, availableCategories || [])
          || findBestCategoryByKeywords(productData.name, availableCategories || []);
        console.log('[IMPORT] 📊 Catégorie trouvée par matching:', selectedCategoryId);
        
        // Si aucune catégorie n'est trouvée, utiliser une catégorie par défaut (UUID explicite)
        if (!selectedCategoryId) {
          selectedCategoryId = 'c1011f0a-a196-4678-934a-85ae8b9cff35'; // Catégorie "Électronique" par défaut
          console.log('[IMPORT] 🔧 Catégorie par défaut forcée (UUID):', selectedCategoryId);
        }

        // Récupérer un vendeur existant (approche simplifiée)
        let defaultVendor: { id: string } | null = null;

        try {
          console.log('[IMPORT] 🔍 Recherche d\'un vendeur existant...');
          
          // 1. Tenter de trouver n'importe quel vendeur existant
          const { data: anyVendor, error: fetchAnyVendorError } = await db
            .from('vendors')
            .select('id')
            .limit(1)
            .single();

          console.log('[IMPORT] 📊 Résultat recherche vendeur:', { 
            anyVendor, 
            fetchAnyVendorError: fetchAnyVendorError ? {
              code: fetchAnyVendorError.code,
              message: fetchAnyVendorError.message,
              details: fetchAnyVendorError.details
            } : null
          });

          if (anyVendor && anyVendor.id) {
            defaultVendor = anyVendor as { id: string };
            console.log('[IMPORT] ✅ Vendeur existant trouvé:', defaultVendor.id);
          } else {
            // 2. Si aucun vendeur n'existe, tenter de créer un vendeur minimal
            console.log('[IMPORT] 🚫 Aucun vendeur trouvé, tentative de création...');
            
            const vendorData = {
              name: 'Vendeur par défaut',
              slug: 'vendeur-defaut-' + Date.now(),
              email: 'default@laboutique.bj',
              status: 'active'
            };
            
            console.log('[IMPORT] 📦 Données vendeur à créer:', vendorData);
            
            const { data: newVendor, error: createVendorError } = await db
              .from('vendors')
              .insert([vendorData])
              .select('id')
              .single();

            console.log('[IMPORT] 📊 Résultat création vendeur:', { 
              newVendor, 
              createVendorError: createVendorError ? {
                code: createVendorError.code,
                message: createVendorError.message,
                details: createVendorError.details,
                hint: createVendorError.hint
              } : null
            });

            if (createVendorError) {
              console.error('[IMPORT] ❌ Error creating default vendor:', createVendorError);
              console.error('[IMPORT] 📋 Vendor creation error details:', {
                code: createVendorError.code,
                message: createVendorError.message,
                details: createVendorError.details,
                hint: createVendorError.hint
              });
              
              return NextResponse.json(
                { 
                  error: 'Impossible de créer un vendeur par défaut', 
                  details: createVendorError.message,
                  errorCode: createVendorError.code,
                  errorDetails: createVendorError.details,
                  hint: createVendorError.hint,
                  vendorData: vendorData
                },
                { status: 500 }
              );
            } else if (newVendor && newVendor.id) {
              defaultVendor = newVendor as { id: string };
              console.log('[IMPORT] ✅ Vendeur par défaut créé:', defaultVendor.id);
            } else {
              console.error('[IMPORT] ❌ Vendeur créé mais ID manquant:', newVendor);
              return NextResponse.json(
                { 
                  error: 'Vendeur créé mais ID manquant', 
                  details: 'La création du vendeur a réussi mais aucun ID n\'a été retourné',
                  newVendor: newVendor
                },
                { status: 500 }
              );
            }
          }
        } catch (vendorError) {
          console.error('[IMPORT] 💥 Unexpected error in vendor handling:', vendorError);
          return NextResponse.json(
            { 
              error: 'Erreur inattendue lors de la gestion du vendeur', 
              details: vendorError instanceof Error ? vendorError.message : 'Erreur inconnue',
              stack: vendorError instanceof Error ? vendorError.stack : undefined
            },
            { status: 500 }
          );
        }

        if (!defaultVendor || !defaultVendor.id) {
          console.error('[IMPORT] ❌ Aucun vendeur par défaut disponible ou créable');
          return NextResponse.json(
            { error: 'Aucun vendeur par défaut disponible ou créable' },
            { status: 500 }
          );
        }

        console.log('[IMPORT] ✅ Vendeur final sélectionné:', defaultVendor.id);

        // Corriger les images pour Next.js : préfixer par '/' si ce sont des fichiers locaux

        const fixedImages = (productData.images || []).map((img: string) => {
          if (!img) return '';
          if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) return img;
          return '/' + img;
        });

        // On force le statut à 'active' quoi qu'il arrive
        console.log('[IMPORT] 🏗️ Construction du payload produit...');
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
          status: publishDirectly ? 'active' : 'draft', // Use publishDirectly from UI
          featured: false,
          meta_title: `${productData.name} - La Boutique B`,
          meta_description: productData.short_description,
          source_url: productData.source_url,
          source_platform: productData.source_platform
        };
        
        console.log('[IMPORT] 📦 Payload produit complet:', {
          name: productPayload.name,
          slug: productPayload.slug,
          price: productPayload.price,
          compare_price: productPayload.compare_price,
          category_id: productPayload.category_id,
          vendor_id: productPayload.vendor_id,
          status: productPayload.status,
          source_platform: productPayload.source_platform,
          imagesCount: productPayload.images?.length || 0
        });
        
        console.log('[IMPORT] 🚀 Appel à ProductsService.createWithClient...');
        // Use admin client to bypass RLS for server-side import when configured
        const creationResponse = await ProductsService.createWithClient(db, productPayload);

        console.log('[IMPORT] 📊 Résultat création produit:', {
          success: creationResponse.success,
          hasData: !!creationResponse.data,
          error: creationResponse.error,
          dataId: creationResponse.data?.id
        });

        if (!creationResponse.success || !creationResponse.data) {
          const errMsg = creationResponse.error || 'Erreur lors de la création du produit';
          console.error('[IMPORT] ❌ Error creating product:', errMsg);
          console.error('[IMPORT] 📋 Creation response details:', creationResponse);
          return NextResponse.json(
            { 
              error: errMsg,
              details: creationResponse.error,
              payload: productPayload
            },
            { status: 500 }
          );
        }

        console.log('[IMPORT] ✅ Produit créé avec succès:', creationResponse.data.id);
        return NextResponse.json({
          success: true,
          data: creationResponse.data,
          message: 'Produit importé avec succès'
        });
      } catch (error) {
        console.error('[IMPORT] 💥 Error creating product:', error);
        console.error('[IMPORT] 📋 Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined
        });
        return NextResponse.json(
          { 
            error: 'Erreur lors de la création du produit',
            details: error instanceof Error ? error.message : 'Erreur inconnue'
          },
          { status: 500 }
        );
      }
    }
    
    // Retourner les données pour prévisualisation
    console.log('[IMPORT] ✅ Retour des données pour prévisualisation');
    return NextResponse.json({
      success: true,
      data: productData,
      message: 'Données récupérées avec succès'
    });
    
  } catch (error) {
    console.error('[IMPORT] 💥 Import error global:', error);
    console.error('[IMPORT] 📋 Global error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}