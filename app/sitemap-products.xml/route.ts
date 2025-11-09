import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  const baseUrl = 'https://www.jomionstore.com';
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Récupérer tous les produits actifs
    const { data: products, error } = await supabase
      .from('products')
      .select('slug, updated_at, images, name, price')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(50000); // Limite Google Sitemap

    if (error) {
      console.error('Error fetching products for sitemap:', error);
      return new NextResponse('Error generating sitemap', { status: 500 });
    }

    const urlEntries = (products || [])
      .map((product) => {
        const lastmod = product.updated_at 
          ? new Date(product.updated_at).toISOString()
          : new Date().toISOString();
        
        const imageUrl = product.images?.[0] || '';
        const imageTag = imageUrl
          ? `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${escapeXml(product.name || '')}</image:title>
      <image:caption>${escapeXml(product.name || '')} - ${product.price} FCFA</image:caption>
    </image:image>`
          : '';

        return `
  <url>
    <loc>${baseUrl}/product/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageTag}
  </url>`;
      })
      .join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating products sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

// Helper pour échapper les caractères XML
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
