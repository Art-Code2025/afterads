import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  category?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'GHEM Store - متجر غيم',
  description = 'متجر إلكتروني متخصص في الملابس والإكسسوارات عالية الجودة',
  keywords = 'متجر إلكتروني, ملابس, إكسسوارات, تسوق أونلاين, غيم',
  image = '/logo.png',
  url = window.location.href,
  type = 'website',
  price,
  currency = 'SAR',
  availability = 'InStock',
  brand = 'GHEM Store',
  category
}) => {
  const fullTitle = title.includes('GHEM Store') ? title : `${title} | GHEM Store`;
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === 'product' ? 'Product' : 'WebSite',
    "name": title,
    "description": description,
    "url": url,
    "image": image,
    ...(type === 'product' && price && {
      "offers": {
        "@type": "Offer",
        "price": price,
        "priceCurrency": currency,
        "availability": `https://schema.org/${availability}`,
        "seller": {
          "@type": "Organization",
          "name": brand
        }
      },
      "brand": {
        "@type": "Brand",
        "name": brand
      },
      ...(category && {
        "category": category
      })
    }),
    ...(type === 'website' && {
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${window.location.origin}/products?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    })
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="GHEM Store" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="GHEM Store" />
      <meta property="og:locale" content="ar_SA" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Product specific meta tags */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency} />
          <meta property="product:availability" content={availability} />
          {category && <meta property="product:category" content={category} />}
        </>
      )}

      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#1f2937" />

      {/* Apple */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="GHEM Store" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Additional Arabic SEO */}
      <meta name="language" content="Arabic" />
      <meta name="geo.region" content="SA" />
      <meta name="geo.country" content="Saudi Arabia" />
    </Helmet>
  );
};

export default SEOHead; 