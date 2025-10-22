'use client';

import Head from 'next/head';

interface DynamicMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  section?: string;
}

const DynamicMeta: React.FC<DynamicMetaProps> = ({
  title = "JomionStore - Centre commercial digital du Bénin",
  description = "Découvrez des milliers de produits authentiques sur JomionStore. Électronique, mode, maison, sport et bien plus. Livraison rapide et service client exceptionnel.",
  keywords = "e-commerce, Bénin, produits, électronique, mode, maison, sport, livraison, achat en ligne",
  image = "/images/jomionstore-og.jpg",
  url = "https://jomionstore.com",
  type = "website",
  section
}) => {
  const fullTitle = section ? `${title} - ${section}` : title;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "JomionStore",
    "description": description,
    "url": url,
    "logo": `${url}/logo.png`,
    "sameAs": [
      "https://facebook.com/jomionstore",
      "https://instagram.com/jomionstore",
      "https://twitter.com/jomionstore"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+229-XX-XX-XX-XX",
      "contactType": "customer service",
      "areaServed": "BJ",
      "availableLanguage": ["French", "English"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BJ",
      "addressLocality": "Cotonou"
    }
  };

  return (
    <Head>
      {/* Meta tags de base */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="JomionStore" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="fr" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="JomionStore" />
      <meta property="og:locale" content="fr_BJ" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@jomionstore" />
      <meta name="twitter:creator" content="@jomionstore" />
      
      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#3b82f6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="JomionStore" />
      
      {/* Canonical */}
      <link rel="canonical" href={url} />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
    </Head>
  );
};

export default DynamicMeta;