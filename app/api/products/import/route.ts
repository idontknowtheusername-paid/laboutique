import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '@/lib/services/products.service';
import { ScrapingService } from '@/lib/services/scraping.service';
import { validateImportedProduct } from '@/lib/schemas/product-import.schema';
import { ScrapedProductData } from '@/lib/services/types';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-server';
import { findBestCategory, getDefaultCategory, findBestCategoryByKeywords } from '@/lib/utils/category-matcher';
import { MockDbService } from '@/lib/services/mock-db.service';

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
        
        // Vérifier si Supabase est configuré
        const useMockDb = !isSupabaseAdminConfigured();
        if (useMockDb) {
          console.log('[IMPORT] 🔄 Utilisation de la base de données mock (Supabase non configuré)');
        }
        
        // Récupérer toutes les catégories disponibles
        console.log('[IMPORT] 🏷️ Récupération des catégories...');
        let availableCategories: any[] = [];
        
        if (useMockDb) {
          // Utiliser la base de données mock
          availableCategories = MockDbService.getCategories();
          console.log('[IMPORT] ✅ Catégories mock récupérées:', availableCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug })));
        } else {
          // Utiliser Supabase
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
        }

        // Trouver la meilleure catégorie basée sur le nom du produit
        console.log('[IMPORT] 🎯 Recherche de la meilleure catégorie pour:', productData.name);
        let selectedCategoryId = findBestCategory(productData.name, availableCategories || [])
          || findBestCategoryByKeywords(productData.name, availableCategories || []);
        console.log('[IMPORT] 📊 Catégorie trouvée par matching:', selectedCategoryId);
        
        // Si aucune catégorie n'est trouvée, créer ou utiliser une catégorie par défaut
        if (!selectedCategoryId) {
          try {
            if (useMockDb) {
              // Utiliser la base de données mock
              const defaultCategory = MockDbService.findCategoryBySlug('produits-importes');
              if (defaultCategory) {
                selectedCategoryId = defaultCategory.id;
                console.log('[IMPORT] ✅ Catégorie "Import" mock trouvée:', selectedCategoryId);
              } else {
                // Créer une catégorie par défaut dans la mock DB
                const newCategory = MockDbService.createCategory({
                  name: 'Produits Importés',
                  slug: 'produits-importes',
                  status: 'active'
                });
                selectedCategoryId = newCategory.id;
                console.log('[IMPORT] ✅ Catégorie par défaut mock créée:', selectedCategoryId);
              }
            } else {
              // Utiliser Supabase
              const { data: defaultCategory, error: defaultCategoryError } = await db
                .from('categories')
                .select('id')
                .eq('slug', 'produits-importes')
                .limit(1)
                .single();

              if (defaultCategory && (defaultCategory as any).id) {
                selectedCategoryId = (defaultCategory as any).id;
                console.log('[IMPORT] ✅ Catégorie "Import" existante trouvée:', selectedCategoryId);
              } else {
                // Créer une catégorie par défaut pour les imports
                const { data: newCategory, error: createCategoryError } = await db
                  .from('categories')
                  .insert([{
                    name: 'Produits Importés',
                    slug: 'produits-importes',
                    description: 'Catégorie par défaut pour les produits importés',
                    status: 'active'
                  }] as any)
                  .select('id')
                  .single();

                if (createCategoryError) {
                  console.error('[IMPORT] ❌ Erreur création catégorie par défaut:', createCategoryError);
                  // Fallback vers la première catégorie disponible
                  if (availableCategories.length > 0) {
                    selectedCategoryId = availableCategories[0].id;
                    console.log('[IMPORT] 🔧 Fallback vers première catégorie disponible:', selectedCategoryId);
                  } else {
                    throw new Error('Aucune catégorie disponible et impossible de créer une catégorie par défaut');
                  }
                } else if (newCategory && (newCategory as any).id) {
                  selectedCategoryId = (newCategory as any).id;
                  console.log('[IMPORT] ✅ Catégorie par défaut créée:', selectedCategoryId);
                }
              }
            }
          } catch (categoryFallbackError) {
            console.error('[IMPORT] ❌ Erreur lors de la gestion de la catégorie par défaut:', categoryFallbackError);
            return NextResponse.json(
              { 
                error: 'Impossible de déterminer une catégorie pour le produit',
                details: categoryFallbackError instanceof Error ? categoryFallbackError.message : 'Erreur inconnue'
              },
              { status: 500 }
            );
          }
        }

        // Éviter les doublons: si un produit avec la même source_url existe déjà, on le renvoie directement
        try {
          if (productData.source_url) {
            console.log('[IMPORT] 🔁 Vérification d\'un produit existant par source_url:', productData.source_url);
            const { data: existingBySource, error: existingBySourceError } = await db
              .from('products')
              .select('id, name, slug, status')
              .eq('source_url', productData.source_url)
              .limit(1)
              .single();

            if (existingBySourceError && existingBySourceError.code !== 'PGRST116') {
              console.warn('[IMPORT] ⚠️ Erreur lors de la vérification par source_url:', existingBySourceError);
            }

            if (existingBySource) {
              console.log('[IMPORT] ✅ Produit déjà importé, renvoi de l\'existant:', (existingBySource as any).slug);
              return NextResponse.json({
                success: true,
                data: existingBySource,
                message: 'Produit déjà importé (source identique), aucun doublon créé'
              });
            }
          }
        } catch (dupeCheckError) {
          console.warn('[IMPORT] ⚠️ Erreur non bloquante de vérification de doublon par source_url:', dupeCheckError);
        }

        // Récupérer un vendeur existant
        let defaultVendor: { id: string } | null = null;

        try {
          console.log('[IMPORT] 🔍 Recherche d\'un vendeur existant...');
          
          if (useMockDb) {
            // Utiliser la base de données mock
            const vendors = MockDbService.getVendors();
            if (vendors.length > 0) {
              defaultVendor = { id: vendors[0].id };
              console.log('[IMPORT] ✅ Vendeur mock existant trouvé:', defaultVendor.id);
            } else {
              // Créer un vendeur par défaut dans la mock DB
              const newVendor = MockDbService.createVendor({
                name: 'Vendeur par défaut',
                slug: 'vendeur-defaut',
                email: 'default@laboutique.bj',
                status: 'active'
              });
              defaultVendor = { id: newVendor.id };
              console.log('[IMPORT] ✅ Vendeur par défaut mock créé:', defaultVendor.id);
            }
          } else {
            // Utiliser Supabase
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

            if (anyVendor && (anyVendor as any).id) {
              defaultVendor = anyVendor as { id: string };
              console.log('[IMPORT] ✅ Vendeur existant trouvé:', defaultVendor.id);
            } else {
              // Créer un vendeur par défaut
              const vendorData = {
                name: 'Vendeur par défaut',
                slug: 'vendeur-defaut-' + Date.now(),
                email: 'default@laboutique.bj',
                status: 'active'
              };
              
              const { data: newVendor, error: createVendorError } = await db
                .from('vendors')
                .insert([vendorData] as any)
                .select('id')
                .single();

              if (createVendorError) {
                console.error('[IMPORT] ❌ Error creating default vendor:', createVendorError);
                return NextResponse.json(
                  { 
                    error: 'Impossible de créer un vendeur par défaut', 
                    details: createVendorError.message
                  },
                  { status: 500 }
                );
              } else if (newVendor && (newVendor as any).id) {
                defaultVendor = newVendor as { id: string };
                console.log('[IMPORT] ✅ Vendeur par défaut créé:', defaultVendor.id);
              }
            }
          }
        } catch (vendorError) {
          console.error('[IMPORT] 💥 Unexpected error in vendor handling:', vendorError);
          return NextResponse.json(
            { 
              error: 'Erreur inattendue lors de la gestion du vendeur', 
              details: vendorError instanceof Error ? vendorError.message : 'Erreur inconnue'
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

        // Corriger et valider les images pour Next.js
        const fixedImages = (productData.images || []).map((img: string) => {
          if (!img) return '/placeholder-product.jpg';
          
          // Garder les URLs externes telles quelles
          if (img.startsWith('http://') || img.startsWith('https://')) {
            return img;
          }
          
          // Préfixer par '/' si c'est un chemin relatif
          if (img.startsWith('/')) {
            return img;
          }
          
          // Préfixer par '/' pour les fichiers locaux
          return '/' + img;
        }).filter(img => img && img !== '/placeholder-product.jpg'); // Filtrer les images vides

        // Générer un slug unique pour éviter les conflits de contrainte unique
        let baseSlug = productData.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
        let uniqueSlug = baseSlug;
        try {
          console.log('[IMPORT] 🔎 Vérification des slugs existants pour la base:', baseSlug);
          const { data: existingSlugs, error: existingSlugsError } = await db
            .from('products')
            .select('slug')
            .ilike('slug', `${baseSlug}%`);

          if (existingSlugsError) {
            console.warn('[IMPORT] ⚠️ Erreur lors de la récupération des slugs existants:', existingSlugsError);
          } else if (existingSlugs && existingSlugs.length > 0) {
            const taken = new Set<string>(existingSlugs.map((r: any) => r.slug));
            if (taken.has(baseSlug)) {
              let suffix = 2;
              while (taken.has(`${baseSlug}-${suffix}`)) suffix++;
              uniqueSlug = `${baseSlug}-${suffix}`;
            }
          }
          console.log('[IMPORT] ✅ Slug unique déterminé:', uniqueSlug);
        } catch (slugError) {
          console.warn('[IMPORT] ⚠️ Erreur non bloquante lors de la génération de slug unique, utilisation du slug de base:', slugError);
        }

        // On force le statut à 'active' quoi qu'il arrive
        console.log('[IMPORT] 🏗️ Construction du payload produit...');
        const productPayload = {
          name: productData.name,
          slug: uniqueSlug,
          description: productData.description,
          short_description: productData.short_description,
          price: productData.price,
          // Mapper le prix original en compare_price pour la base de données
          compare_price: productData.original_price,
          images: fixedImages,
          category_id: selectedCategoryId || undefined, // Convert null to undefined
          vendor_id: defaultVendor.id,
          sku: productData.sku || `IMPORT-${Date.now()}`,
          quantity: productData.stock_quantity || 0,
          track_quantity: true,
          status: (publishDirectly ? 'active' : 'draft') as 'active' | 'draft', // Use publishDirectly from UI
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
        
        console.log('[IMPORT] 🚀 Création du produit...');
        let creationResponse;
        
        if (useMockDb) {
          // Utiliser la base de données mock
          try {
            const newProduct = MockDbService.createProduct(productPayload);
            creationResponse = {
              success: true,
              data: newProduct,
              error: null
            };
            console.log('[IMPORT] ✅ Produit créé dans la mock DB:', newProduct.id);
          } catch (error) {
            creationResponse = {
              success: false,
              data: null,
              error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
          }
        } else {
          // Utiliser Supabase
          creationResponse = await ProductsService.createWithClient(db, productPayload);
        }

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
        console.log('[IMPORT] 📊 Données produit créé:', {
          id: creationResponse.data.id,
          name: creationResponse.data.name,
          category_id: creationResponse.data.category_id,
          vendor_id: creationResponse.data.vendor_id,
          status: creationResponse.data.status
        });
        
        // Vérifier que les champs requis sont présents
        if (!creationResponse.data.category_id || !creationResponse.data.vendor_id) {
          console.error('[IMPORT] ❌ Produit créé mais catégorie ou vendeur manquant:', {
            category_id: creationResponse.data.category_id,
            vendor_id: creationResponse.data.vendor_id
          });
          return NextResponse.json(
            { 
              error: 'Produit créé mais catégorie ou vendeur manquant',
              details: `category_id: ${creationResponse.data.category_id}, vendor_id: ${creationResponse.data.vendor_id}`,
              data: creationResponse.data
            },
            { status: 500 }
          );
        }
        
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