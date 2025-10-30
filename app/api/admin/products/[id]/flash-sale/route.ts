// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: productId } = await params;
        const supabase = supabaseAdmin;

        // Récupérer les informations du produit
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Produit non trouvé' },
                { status: 404 }
            );
        }

        // Vérifier si c'est une vente flash (utilise compare_price comme fallback)
        const isFlashSale = product.is_flash_sale || (product.compare_price && product.compare_price > product.price);
        const flashPrice = product.flash_price || product.price;
        const originalPrice = product.compare_price || product.price;

        // Calculer les informations de vente flash
        const now = new Date();
        const endDate = product.flash_end_date ? new Date(product.flash_end_date) : null;
        const isActive = isFlashSale && (!endDate || endDate > now);

        let timeLeft = null;
        if (isActive && endDate) {
            const timeLeftMs = endDate.getTime() - now.getTime();
            timeLeft = {
                hours: Math.max(0, Math.floor(timeLeftMs / (1000 * 60 * 60))),
                minutes: Math.max(0, Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60))),
                seconds: Math.max(0, Math.floor((timeLeftMs % (1000 * 60)) / 1000)),
                total: Math.max(0, timeLeftMs)
            };
        }

        const discountPercentage = isFlashSale && originalPrice > flashPrice
            ? Math.round(((originalPrice - flashPrice) / originalPrice) * 100)
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                id: product.id,
                name: product.name,
                price: product.price,
                compare_price: product.compare_price,
                is_flash_sale: isFlashSale,
                flash_price: flashPrice,
                flash_end_date: product.flash_end_date,
                flash_max_quantity: product.flash_max_quantity,
                flash_sold_quantity: product.flash_sold_quantity || 0,
                is_active: isActive,
                time_left: timeLeft,
                discount_percentage: discountPercentage,
                available_stock: product.flash_max_quantity
                    ? Math.max(0, product.flash_max_quantity - (product.flash_sold_quantity || 0))
                    : null
            }
        });

    } catch (error) {
        console.error('Erreur API flash sale GET:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur lors de la récupération des données' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: productId } = await params;
        const body = await request.json();
        const { enabled, flash_price, duration_hours, max_quantity } = body;

        const supabase = supabaseAdmin;

        // Validation
        if (enabled && (!flash_price || flash_price <= 0)) {
            return NextResponse.json(
                { success: false, error: 'Prix flash requis quand activé' },
                { status: 400 }
            );
        }

        // Récupérer le produit existant
        const { data: existingProduct, error: checkError } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (checkError || !existingProduct) {
            return NextResponse.json(
                { success: false, error: 'Produit non trouvé' },
                { status: 404 }
            );
        }

        // Calculer la date de fin si durée spécifiée
        let flashEndDate: string | null = null;
        if (enabled && duration_hours && duration_hours > 0) {
            const endDate = new Date();
            endDate.setHours(endDate.getHours() + duration_hours);
            flashEndDate = endDate.toISOString();
        }

        // Préparer les données de mise à jour
        const updateData: any = {};

        if (enabled) {
            // Activer la vente flash
            if ('is_flash_sale' in existingProduct) {
                // Utiliser les nouvelles colonnes si elles existent
                updateData.is_flash_sale = true;
                updateData.flash_price = flash_price;
                updateData.flash_end_date = flashEndDate;
                updateData.flash_max_quantity = max_quantity || null;
                updateData.flash_sold_quantity = 0;
            } else {
                // Fallback avec compare_price
                updateData.compare_price = existingProduct.price;
                updateData.price = flash_price;
            }
        } else {
            // Désactiver la vente flash
            if ('is_flash_sale' in existingProduct) {
                updateData.is_flash_sale = false;
                updateData.flash_price = null;
                updateData.flash_end_date = null;
                updateData.flash_max_quantity = null;
                updateData.flash_sold_quantity = null;
            } else {
                // Restaurer le prix original depuis compare_price
                if (existingProduct.compare_price) {
                    updateData.price = existingProduct.compare_price;
                    updateData.compare_price = null;
                }
            }
        }

        updateData.updated_at = new Date().toISOString();

        // Mettre à jour le produit
        const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', productId)
            .select('*')
            .single();

        if (updateError) {
            throw new Error(updateError.message);
        }

        return NextResponse.json({
            success: true,
            data: updatedProduct,
            message: enabled ? 'Vente flash activée' : 'Vente flash désactivée'
        });

    } catch (error) {
        console.error('Erreur API flash sale PUT:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur lors de la mise à jour' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: productId } = await params;
        const supabase = supabaseAdmin;

        // Récupérer le produit existant
        const { data: existingProduct, error: checkError } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (checkError || !existingProduct) {
            return NextResponse.json(
                { success: false, error: 'Produit non trouvé' },
                { status: 404 }
            );
        }

        // Préparer les données de mise à jour pour désactiver
        const updateData: any = {};

        if ('is_flash_sale' in existingProduct) {
            // Utiliser les nouvelles colonnes
            updateData.is_flash_sale = false;
            updateData.flash_price = null;
            updateData.flash_end_date = null;
            updateData.flash_max_quantity = null;
            updateData.flash_sold_quantity = null;
        } else {
            // Fallback avec compare_price
            if (existingProduct.compare_price) {
                updateData.price = existingProduct.compare_price;
                updateData.compare_price = null;
            }
        }

        updateData.updated_at = new Date().toISOString();

        // Mettre à jour le produit
        const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', productId)
            .select('*')
            .single();

        if (updateError) {
            throw new Error(updateError.message);
        }

        return NextResponse.json({
            success: true,
            data: updatedProduct,
            message: 'Vente flash supprimée'
        });

    } catch (error) {
        console.error('Erreur API flash sale DELETE:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur lors de la suppression' },
            { status: 500 }
        );
    }
}
