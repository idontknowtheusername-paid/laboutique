import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // For now, return the image URL as-is
    // In production, you might want to proxy the image or add security headers
    return NextResponse.json({
      success: true,
      data: {
        url: imageUrl,
        alt: 'Product image'
      }
    });
  } catch (error) {
    console.error('Image API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Mock image upload response
    // In production, you would upload to Supabase Storage or another service
    const mockUrl = `https://images.unsplash.com/photo-${Date.now()}`;
    
    return NextResponse.json({
      success: true,
      data: {
        url: mockUrl,
        filename: file.name,
        size: file.size
      }
    });
  } catch (error) {
    console.error('Image upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}