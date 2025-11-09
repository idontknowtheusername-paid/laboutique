import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  const baseUrl = 'https://www.jomionstore.com';
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Vérifier si la table blog existe et récupérer les articles
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, title, featured_image')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(1000);

    // Si la table n'existe pas encore, retourner un sitemap vide
    if (error) {
      console.log('Blog table not found or error:', error.message);
      const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Blog sitemap - En attente de contenu -->
</urlset>`;
      
      return new NextResponse(emptySitemap, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      });
    }

    const urlEntries = (posts || [])
      .map((post) => {
        const lastmod = post.updated_at 
          ? new Date(post.updated_at).toISOString()
          : new Date().toISOString();
        
        const imageUrl = post.featured_image || '';
        const imageTag = imageUrl
          ? `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${escapeXml(post.title || '')}</image:title>
    </image:image>`
          : '';

        return `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>${imageTag}
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
    console.error('Error generating blog sitemap:', error);
    
    // Retourner un sitemap vide en cas d'erreur
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Blog sitemap - Erreur de génération -->
</urlset>`;
    
    return new NextResponse(emptySitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
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
