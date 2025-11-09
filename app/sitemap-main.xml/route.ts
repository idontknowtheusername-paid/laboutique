import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://www.jomionstore.com';
  const currentDate = new Date().toISOString();

  // Pages statiques principales avec priorités optimisées
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily', lastmod: currentDate },
    { url: '/products', priority: '0.9', changefreq: 'daily', lastmod: currentDate },
    { url: '/products?sale=true', priority: '0.9', changefreq: 'daily', lastmod: currentDate },
    { url: '/about', priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
    { url: '/contact', priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
    { url: '/faq', priority: '0.6', changefreq: 'monthly', lastmod: currentDate },
    { url: '/delivery-info', priority: '0.6', changefreq: 'monthly', lastmod: currentDate },
    { url: '/payment-info', priority: '0.6', changefreq: 'monthly', lastmod: currentDate },
    { url: '/shipping-returns', priority: '0.6', changefreq: 'monthly', lastmod: currentDate },
    { url: '/warranty', priority: '0.5', changefreq: 'monthly', lastmod: currentDate },
    { url: '/terms', priority: '0.5', changefreq: 'monthly', lastmod: currentDate },
    { url: '/privacy', priority: '0.5', changefreq: 'monthly', lastmod: currentDate },
    { url: '/cookies', priority: '0.4', changefreq: 'monthly', lastmod: currentDate },
    { url: '/press', priority: '0.5', changefreq: 'monthly', lastmod: currentDate },
    { url: '/careers', priority: '0.5', changefreq: 'monthly', lastmod: currentDate },
    { url: '/help', priority: '0.6', changefreq: 'monthly', lastmod: currentDate },
    { url: '/size-guide', priority: '0.5', changefreq: 'monthly', lastmod: currentDate },
    { url: '/order-tracking', priority: '0.6', changefreq: 'weekly', lastmod: currentDate },
  ];

  const urlEntries = staticPages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
