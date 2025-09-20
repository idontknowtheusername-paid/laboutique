import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '@/lib/services/products.service';
import { ScrapingService } from '@/lib/services/scraping.service';
import { ScrapedProductData } from '@/lib/services/types';

// Fonction pour valider l'URL
function validateUrl(url: string): { valid: boolean; error?: string } {
  return ScrapingService.validateProductUrl(url);
}

export async function POST(request: NextRequest) {
  try {
    const { url, importDirectly = false } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
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
    const productData = await ScrapingService.scrapeProduct(url);
    
    if (!productData) {
      return NextResponse.json(
        { error: 'Impossible de récupérer les données du produit' },
        { status: 500 }
      );
    }
    
    // Si import direct, créer le produit
    if (importDirectly) {
      try {
        const product = await ProductsService.create({
          name: productData.name,
          slug: productData.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
          description: productData.description,
          short_description: productData.short_description,
          price: productData.price,
          original_price: productData.original_price,
          images: productData.images,
          category_id: 1, // Catégorie par défaut
          vendor_id: 1, // Vendeur par défaut
          sku: productData.sku,
          quantity: productData.stock_quantity || 0,
          track_quantity: true,
          status: 'draft',
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