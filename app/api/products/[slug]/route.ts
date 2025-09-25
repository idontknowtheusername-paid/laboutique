import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { ProductsService } from '@/lib/services/products.service';

export async function GET(request: NextRequest, context: { params: { slug: string } }) {
	try {
		const slug = context.params.slug;
		const result = await ProductsService.getBySlug(slug);

		if (!result.success || !result.data) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 });
		}

		const body = JSON.stringify(result);
		const etag = 'W/"' + crypto.createHash('sha1').update(body).digest('hex') + '"';
		const ifNoneMatch = request.headers.get('if-none-match');
		if (ifNoneMatch && ifNoneMatch === etag) {
			const notModified = new NextResponse(null, { status: 304 });
			notModified.headers.set('ETag', etag);
			notModified.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
			return notModified;
		}

		const res = new NextResponse(body, {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
		res.headers.set('ETag', etag);
		res.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
		return res;
	} catch (error) {
		console.error('Product detail API error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}