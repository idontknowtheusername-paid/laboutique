import { NextRequest, NextResponse } from 'next/server';
import { getAliExpressDropshipApiService } from '@/lib/services/aliexpress-dropship-api.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id } = body;

    const apiService = getAliExpressDropshipApiService();
    const product = await apiService.getProductDetails(product_id);

    return NextResponse.json({
      success: true,
      product: product,
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
