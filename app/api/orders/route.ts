import { NextRequest, NextResponse } from 'next/server';
import { OrdersService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');

    // Build filters
    const filters: any = {};
    if (userId) filters.user_id = userId;
    if (status) filters.status = status;
    if (paymentStatus) filters.payment_status = paymentStatus;

    // Call the service
    const result = await OrdersService.getAll(
      filters,
      { page, limit }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.user_id || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, items' },
        { status: 400 }
      );
    }

    // Call the service to create order
    const result = await OrdersService.create(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create order' },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Orders POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}