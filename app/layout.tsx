import './globals.css';
import type { Metadata } from 'next';
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "Be Shop - Benin Elite Shopping Experience",
  description:
    "Be Shop est la première plateforme e-commerce du Bénin offrant une expérience d'achat premium avec des produits authentiques, une livraison rapide et un service client exceptionnel.",
  keywords:
    "e-commerce Bénin, shopping en ligne, électronique, mode, maison, beauté, Be Shop",
  authors: [{ name: "Be Shop Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "fr_BJ",
    url: "https://beshop.bj",
    siteName: "Be Shop",
    title: "Be Shop - Benin Elite Shopping Experience",
    description: "La première plateforme e-commerce premium du Bénin",
    images: ["/images/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@BeShopBenin",
    title: "Be Shop - Benin Elite Shopping Experience",
    description: "La première plateforme e-commerce premium du Bénin",
    images: ["/images/twitter-image.jpg"],
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://beshop.bj'),
};

export default function RootLayout({
  children,
}: {
  children: import("react").ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://beshop.bj" />
        <meta name="theme-color" content="#1E40AF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Be Shop" />
      </head>
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}