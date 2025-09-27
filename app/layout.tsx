import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "JomiaStore - Benin Elite Shopping Experience",
  description:
    "JomiaStore Hub - Le centre commercial digital du Bénin. Découvrez des milliers de produits authentiques avec une livraison rapide et un service client exceptionnel.",
  keywords:
    "e-commerce Bénin, shopping en ligne, électronique, mode, maison, beauté, JomiaStore",
  authors: [{ name: "JomiaStore Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "fr_BJ",
    url: "https://www.jomiastore.com",
    siteName: "JomiaStore",
    title: "JomiaStore - Benin Elite Shopping Experience",
    description: "JomiaStore Hub - Le centre commercial digital du Bénin",
    images: ["/images/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@JomiaStoreBenin",
    title: "JomiaStore - Benin Elite Shopping Experience",
    description: "JomiaStore Hub - Le centre commercial digital du Bénin",
    images: ["/images/twitter-image.jpg"],
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jomiastore.com'),
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
        <link rel="canonical" href="https://www.jomiastore.com" />
        <meta name="theme-color" content="#1E40AF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="JomiaStore" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
        <link rel="dns-prefetch" href="https://qdagyxqkqgbzqrqzjvzz.supabase.co" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
        
        {/* Service Worker Registration */}
        <Script
          id="sw-registration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />

        {/* Performance monitoring */}
        <Script
          id="performance-monitor"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                // Monitor Core Web Vitals
                function sendToAnalytics(metric) {
                  if (process.env.NODE_ENV === 'production') {
                    // Send to your analytics service
                    console.log(metric);
                  }
                }

                // Monitor LCP
                new PerformanceObserver((entryList) => {
                  for (const entry of entryList.getEntries()) {
                    sendToAnalytics({
                      name: 'LCP',
                      value: entry.startTime,
                      rating: entry.startTime > 4000 ? 'poor' : entry.startTime > 2500 ? 'needs-improvement' : 'good'
                    });
                  }
                }).observe({entryTypes: ['largest-contentful-paint']});

                // Monitor FID
                new PerformanceObserver((entryList) => {
                  for (const entry of entryList.getEntries()) {
                    sendToAnalytics({
                      name: 'FID',
                      value: entry.processingStart - entry.startTime,
                      rating: entry.processingStart - entry.startTime > 300 ? 'poor' : entry.processingStart - entry.startTime > 100 ? 'needs-improvement' : 'good'
                    });
                  }
                }).observe({entryTypes: ['first-input']});

                // Monitor CLS
                let cumulativeLayoutShift = 0;
                new PerformanceObserver((entryList) => {
                  for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                      cumulativeLayoutShift += entry.value;
                    }
                  }
                  sendToAnalytics({
                    name: 'CLS',
                    value: cumulativeLayoutShift,
                    rating: cumulativeLayoutShift > 0.25 ? 'poor' : cumulativeLayoutShift > 0.1 ? 'needs-improvement' : 'good'
                  });
                }).observe({entryTypes: ['layout-shift']});
              }
            `,
          }}
        />
      </body>
    </html>
  );
}