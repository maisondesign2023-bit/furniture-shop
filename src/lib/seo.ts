import type { Metadata } from "next";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "家具品牌";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const url = `${SITE_URL}${opts.path}`;
  return {
    title: `${opts.title} | ${SITE_NAME}`,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      images: opts.image ? [{ url: opts.image }] : undefined,
      locale: "zh_TW",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: opts.image ? [opts.image] : undefined,
    },
  };
}

export function productJsonLd(product: {
  name: string;
  description: string | null;
  price: number;
  images: string[];
  slug: string;
  inStock: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images,
    offers: {
      "@type": "Offer",
      priceCurrency: "TWD",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/product/${product.slug}`,
    },
  };
}
