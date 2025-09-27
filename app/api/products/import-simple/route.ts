import { NextRequest, NextResponse } from 'next/server';
import { MockDbService } from '@/lib/services/mock-db.service';

export async function POST(request: NextRequest) {
  try {
    const { url, importDirectly = false, publishDirectly = false } = await request.json();
    console.log('[IMPORT-SIMPLE] Params:', { url, importDirectly, publishDirectly });
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL requise' },
        { status: 400 }
      );
    }
    
    // Simuler des données de produit
    const mockProductData = {
      name: `Produit importé de ${url}`,
      description: 'Description du produit importé',
      short_description: 'Produit importé',
      price: 29.99,
      original_price: 39.99,
      stock_quantity: 10,
      images: ['https://via.placeholder.com/400x400?text=Product+Image'],
      sku: `IMPORT-${Date.now()}`,
      source_platform: 'alibaba' as const,
      source_url: url
    };
    
    if (importDirectly) {
      // Récupérer les catégories et vendeurs
      const categories = MockDbService.getCategories();
      const vendors = MockDbService.getVendors();
      
      if (categories.length === 0 || vendors.length === 0) {
        return NextResponse.json(
          { 
            error: 'Base de données mock non initialisée',
            details: 'Veuillez exécuter le script de setup de la base de données mock'
          },
          { status: 500 }
        );
      }
      
      // Créer le produit
      const newProduct = MockDbService.createProduct({
        name: mockProductData.name,
        slug: `produit-importe-${Date.now()}`,
        description: mockProductData.description,
        short_description: mockProductData.short_description,
        price: mockProductData.price,
        compare_price: mockProductData.original_price,
        images: mockProductData.images,
        sku: mockProductData.sku,
        category_id: categories[0].id, // Utiliser la première catégorie
        vendor_id: vendors[0].id, // Utiliser le premier vendeur
        status: publishDirectly ? 'active' : 'draft',
        source_url: mockProductData.source_url,
        source_platform: mockProductData.source_platform
      });
      
      console.log('[IMPORT-SIMPLE] ✅ Produit créé:', newProduct.id);
      
      return NextResponse.json({
        success: true,
        data: newProduct,
        message: 'Produit importé avec succès'
      });
    }
    
    // Retourner les données pour prévisualisation
    return NextResponse.json({
      success: true,
      data: mockProductData,
      message: 'Données récupérées avec succès'
    });
    
  } catch (error) {
    console.error('[IMPORT-SIMPLE] 💥 Error:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}