import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// =============================================
// GET /api/reviews?product_id=xxx
// List all reviews for a product
// =============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json(
        { error: 'product_id is required' },
        { status: 400 }
      );
    }

    // Get reviews with user info
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        id,
        rating,
        title,
        comment,
        verified_purchase,
        helpful_count,
        created_at,
        user_id
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Reviews API] Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Get user profiles for the reviews (name, avatar, etc.)
    const userIds = reviews && reviews.length > 0 ? [...new Set(reviews.map((r: any) => r.user_id))] : [];
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds);

    // Merge user data with reviews
    const reviewsWithUsers = reviews?.map((review: any) => {
      const profile: any = profiles?.find((p: any) => p.id === review.user_id);
      return {
        ...review,
        user_name: profile?.full_name || 'Utilisateur',
        user_avatar: profile?.avatar_url || null,
      };
    });

    return NextResponse.json({
      success: true,
      reviews: reviewsWithUsers,
      count: reviewsWithUsers?.length || 0,
    });

  } catch (error) {
    console.error('[Reviews API] Exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// POST /api/reviews
// Create a new review
// =============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, user_id, rating, title, comment } = body;

    // Validation
    if (!product_id || !user_id || !rating) {
      return NextResponse.json(
        { error: 'product_id, user_id and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if product exists
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user already reviewed this product
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('product_id', product_id)
      .eq('user_id', user_id)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: 'Vous avez déjà laissé un avis pour ce produit' },
        { status: 409 }
      );
    }

    // Create review
    const { data: review, error: insertError } = await (supabaseAdmin as any)
      .from('reviews')
      .insert({
        product_id,
        user_id,
        rating,
        title: title || null,
        comment: comment || null,
        verified_purchase: false, // TODO: Check if user actually purchased this product
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Reviews API] Error creating review:', insertError);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      review,
      message: 'Merci pour votre avis !',
    }, { status: 201 });

  } catch (error) {
    console.error('[Reviews API] Exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// DELETE /api/reviews/:id
// Delete a review (user can only delete their own)
// =============================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');
    const userId = searchParams.get('user_id');

    if (!reviewId || !userId) {
      return NextResponse.json(
        { error: 'review id and user_id are required' },
        { status: 400 }
      );
    }

    // Delete review (check user owns it)
    const { error: deleteError } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('[Reviews API] Error deleting review:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Avis supprimé avec succès',
    });

  } catch (error) {
    console.error('[Reviews API] Exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
