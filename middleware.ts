import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Define protected routes that require authentication
const protectedRoutes = [
  '/account',
  '/account/profile',
  '/account/orders',
  '/account/wishlist',
  '/checkout'
];

// Define admin routes that require admin role
const adminRoutes = [
  '/admin'
];

// Define vendor routes that require vendor role
const vendorRoutes = [
  '/vendor'
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/products',
  '/categories',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/callback',
  '/terms',
  '/privacy'
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;
  
  // Let client-side handle all auth logic to avoid middleware complexity
  // Only handle the auth callback route
  if (pathname === '/auth/callback') {
    return res;
  }
  
  // For all other routes, let the client-side ProtectedRoute components handle auth
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