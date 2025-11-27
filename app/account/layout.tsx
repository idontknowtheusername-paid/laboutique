"use client";
import Header from '@/components/layout/Header';
import CategoryMenu from '@/components/layout/CategoryMenu';
import Footer from '@/components/layout/Footer';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-jomionstore-background">
      <Header />
      <CategoryMenu />

      <div className="container py-8 pb-24 lg:pb-8">
        {children}
      </div>

      {/* Footer masqué sur mobile/tablette, visible sur desktop uniquement */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
}

