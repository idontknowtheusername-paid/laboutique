import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cache policy configuration
export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;
  
  // Helper to set cache headers
  const setCache = (value: string) => {
    res.headers.set('Cache-Control', value);
  };

  // Static-like public pages (marketing/info)
  if (
    pathname === '/' || 
    pathname.startsWith('/about') || 
    pathname.startsWith('/help') || 
    pathname.startsWith('/faq') || 
    pathname.startsWith('/privacy') || 
    pathname.startsWith('/terms') || 
    pathname.startsWith('/press') || 
    pathname.startsWith('/careers')
  ) {
    setCache('public, s-maxage=300, stale-while-revalidate=600');
  }

  // Product/category listing pages
  else if (
    pathname.startsWith('/products') || 
    pathname.startsWith('/category') || 
    pathname.startsWith('/categories')
  ) {
    setCache('public, s-maxage=120, stale-while-revalidate=300');
  }

  // Sensitive/user-specific routes: disable caching
  else if (
    pathname.startsWith('/account') || 
    pathname.startsWith('/checkout') || 
    pathname.startsWith('/cart') || 
    pathname.startsWith('/admin') ||
    pathname.startsWith('/vendor')
  ) {
    setCache('private, no-store');
  }

  // Auth callback route
  if (pathname === '/auth/callback') {
    return res;
  }
  
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};