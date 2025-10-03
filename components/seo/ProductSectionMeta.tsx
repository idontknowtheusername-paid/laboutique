'use client';

import Head from 'next/head';

interface ProductSectionMetaProps {
  sectionTitle: string;
  sectionDescription: string;
  products: any[];
  category?: string;
  baseUrl?: string;
}

const ProductSectionMeta: React.FC<ProductSectionMetaProps> = ({
  sectionTitle,
  sectionDescription,
  products,
  category,
  baseUrl = "https://jomionstore.com"
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": sectionTitle,
    "description": sectionDescription,
    "url": `${baseUrl}/#${sectionTitle.toLowerCase().replace(/\s+/g, '-')}`,
    "numberOfItems": products.length,
    "itemListElement": products.slice(0, 10).map((product, index) => ({
      "@type": "Product",
      "position": index + 1,
      "name": product.name,
      "description": product.description || product.name,
      "image": product.images?.[0] || "/images/placeholder-product.jpg",
      "url": `${baseUrl}/product/${product.slug}`,
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "XOF",
        "availability": product.status === 'active' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      },
      "brand": {
        "@type": "Brand",
        "name": product.brand || "JomionStore"
      },
      "category": category || "Produits"
    }))
  };

  return (
    <Head>
      {/* Meta tags pour la section */}
      <meta name={`${sectionTitle.toLowerCase().replace(/\s+/g, '-')}-title`} content={sectionTitle} />
      <meta name={`${sectionTitle.toLowerCase().replace(/\s+/g, '-')}-description`} content={sectionDescription} />
      <meta name={`${sectionTitle.toLowerCase().replace(/\s+/g, '-')}-count`} content={products.length.toString()} />
      
      {/* Structured Data pour la section */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
    </Head>
  );
};

export default ProductSectionMeta;