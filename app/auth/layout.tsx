'use client';

import Header from '@/components/layout/Header';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className="min-h-screen bg-jomionstore-background pt-[140px]">
        <Header />
        <main className="container py-6">
          {children}
        </main>
      </div>
  );
}

