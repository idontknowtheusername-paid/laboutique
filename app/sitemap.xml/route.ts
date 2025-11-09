import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://www.jomionstore.com';
  const currentDate = new Date().toISOString();

  // Pages statiques principales
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' }, // Homepage
    { url: '/products', priority: '0.9', changefreq: 'daily' },
    { url: '/products?sale=true', priority: '0.9', changefreq: 'daily' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/faq', priority: '0.6', changefreq: 'monthly' },
    { url: '/delivery-info', priority: '0.6', changefreq: 'monthly' },
    { url: '/payment-info', priority: '0.6', changefreq: 'monthly' },
    { url: '/shipping-returns', priority: '0.6', changefreq: 'monthly' },
    { url: '/warranty', priority: '0.5', changefreq: 'monthly' },
    { url: '/terms', priority: '0.5', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.5', changefreq: 'monthly' },
    { url: '/cookies', priority: '0.4', changefreq: 'monthly' },
    { url: '/press', priority: '0.5', changefreq: 'monthly' },
    { url: '/careers', priority: '0.5', changefreq: 'monthly' },
    { url: '/help', priority: '0.6', changefreq: 'monthly' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Sitemap principal -->
  <sitemap>
    <loc>${baseUrl}/sitemap-main.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- Sitemap des produits -->
  <sitemap>
    <loc>${baseUrl}/sitemap-products.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- Sitemap des catégories -->
  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- Sitemap du blog (si activé) -->
  <sitemap>
    <loc>${baseUrl}/sitemap-blog.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
