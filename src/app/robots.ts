import type { MetadataRoute } from "next";

export const runtime = "edge";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/cart", "/checkout", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
