'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import CookiePreferences from '@/components/layout/CookiePreferences';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CookiePreferencesPage() {
  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-jomionstore-primary">Accueil</Link>
          <span>/</span>
          <Link href="/cookies" className="hover:text-jomionstore-primary">Cookies</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Préférences</span>
        </nav>

        {/* Back button */}
        <div className="mb-6">
          <Link 
            href="/cookies" 
            className="inline-flex items-center gap-2 text-jomionstore-primary hover:text-orange-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la politique de cookies
          </Link>
        </div>

        {/* Cookie Preferences Component */}
        <CookiePreferences />
      </div>

      <Footer />
    </div>
  );
}