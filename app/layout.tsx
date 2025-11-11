import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import { AppProviders } from "@/components/providers/AppProviders";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { WebVitals } from "@/components/analytics/WebVitals";
import GlobalCartAnimation from '@/components/ui/GlobalCartAnimation';
import CookieBanner from '@/components/layout/CookieBanner';
import NewsletterPopupManager from '@/components/layout/NewsletterPopupManager';
import PopupManager from '@/components/layout/PopupManager';

// Optimize font loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: "JomionStore - Centre commercial digital du Bénin",
    template: "%s | JomionStore"
  },
  description:
    "JomionStore - Le centre commercial digital du Bénin. Découvrez des milliers de produits authentiques avec une livraison rapide et un service client exceptionnel.",
  keywords: [
    "e-commerce Bénin",
    "shopping en ligne",
    "électronique",
    "mode",
    "maison",
    "beauté",
    "JomionStore",
    "achat en ligne Bénin",
    "livraison Cotonou",
    "boutique en ligne"
  ],
  authors: [{ name: "JomionStore Team" }],
  creator: "JomionStore",
  publisher: "JomionStore",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_BJ",
    url: "https://www.jomionstore.com",
    siteName: "JomionStore",
    title: "JomionStore - Centre commercial digital du Bénin",
    description: "Découvrez des milliers de produits authentiques avec une livraison rapide et un service client exceptionnel.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "JomionStore - Shopping en ligne au Bénin"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@JomionStoreBenin",
    creator: "@JomionStoreBenin",
    title: "JomionStore - Centre commercial digital du Bénin",
    description: "Découvrez des milliers de produits authentiques avec une livraison rapide et un service client exceptionnel.",
    images: ["/images/twitter-image.jpg"],
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jomionstore.com'),
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
  },
};

export default function RootLayout({
  children,
}: {
    children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href="https://www.jomionstore.com" />
        <meta name="theme-color" content="#FF5722" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="JomionStore" />

        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://qdagyxqkqgbzqrqzjvzz.supabase.co" />

        {/* DNS prefetch for non-critical domains */}
        <link rel="dns-prefetch" href="https://images.pexels.com" />

        {/* Preload critical assets */}
        <link rel="preload" as="image" href="/images/latestlogo.jpg" fetchPriority="high" />

        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-sans antialiased">
        <WebVitals />
        <AppProviders>
          {children}
          <GlobalCartAnimation />
          <CookieBanner />
          <NewsletterPopupManager />
          <PopupManager />
        </AppProviders>
        <SpeedInsights />
        
        {/* Désactiver la toolbar Vercel en production */}
        {process.env.NODE_ENV === 'production' && (
          <Script
            id="disable-vercel-toolbar"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof window !== 'undefined') {
                  // Désactiver la toolbar Vercel
                  const vercelToolbar = document.querySelector('[data-vercel-toolbar]');
                  if (vercelToolbar) {
                    vercelToolbar.style.display = 'none';
                  }

                  // Supprimer les scripts Vercel toolbar
                  const vercelScripts = document.querySelectorAll('script[src*="vercel"]');
                  vercelScripts.forEach(script => script.remove());
                }
              `,
            }}
          />
        )}
        
        {/* Chunk Loading Error Handler */}
        <Script
          id="chunk-error-handler"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Detect chunk loading errors and reload the page
              window.addEventListener('error', function(event) {
                if (event.message && (
                  event.message.includes('Failed to load chunk') ||
                  event.message.includes('Loading chunk') ||
                  event.message.includes('ChunkLoadError')
                )) {
                  console.warn('Chunk loading error detected, reloading page...');
                  // Reload only once to avoid infinite loops
                  if (!sessionStorage.getItem('chunk-reload-attempted')) {
                    sessionStorage.setItem('chunk-reload-attempted', 'true');
                    window.location.reload();
                  } else {
                    sessionStorage.removeItem('chunk-reload-attempted');
                  }
                }
              }, true);
            `,
          }}
        />

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
                      // Check for updates every 5 minutes
                      setInterval(function() {
                        registration.update();
                      }, 5 * 60 * 1000);
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
                  // Only log in development, send to analytics in production
                  console.log(metric);
                }

                // Check if PerformanceObserver is supported
                if ('PerformanceObserver' in window) {
                  try {
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
                  } catch (error) {
                    console.warn('Performance monitoring setup failed:', error);
                  }
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}