import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `# JomionStore - Robots.txt
# Optimisé pour le SEO et l'indexation

User-agent: *
Allow: /

# Pages importantes à crawler en priorité
Allow: /products
Allow: /category
Allow: /product
Allow: /about
Allow: /contact
Allow: /faq
Allow: /blog

# Pages à ne pas indexer
Disallow: /api/
Disallow: /admin/
Disallow: /account/
Disallow: /checkout/
Disallow: /cart/
Disallow: /auth/
Disallow: /test-*
Disallow: /debug/
Disallow: /unauthorized/
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*fbclid=*

# Fichiers et dossiers système
Disallow: /_next/
Disallow: /static/

# Sitemaps
Sitemap: https://www.jomionstore.com/sitemap.xml
Sitemap: https://www.jomionstore.com/sitemap-products.xml
Sitemap: https://www.jomionstore.com/sitemap-categories.xml

# Crawl-delay pour éviter la surcharge
Crawl-delay: 1

# Règles spécifiques pour les bots
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 1

# Bloquer les mauvais bots
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
