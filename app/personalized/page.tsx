'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';
import PersonalizedOffers from '@/components/home/PersonalizedOffers';

export default function PersonalizedPage() {
  return (
    <main className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />
      <div className="container py-8">
        <PersonalizedOffers />
      </div>
      <Footer />
    </main>
  );
}

