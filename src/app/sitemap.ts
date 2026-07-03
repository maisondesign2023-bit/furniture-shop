import type { MetadataRoute } from "next";
import { createServerSupabase } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabase();

  const [{ data: products }, { data: categories }, { data: posts }, { data: cases }] =
    await Promise.all([
      supabase.from("products").select("slug, updated_at").eq("status", "published"),
      supabase.from("categories").select("slug"),
      supabase.from("blog_posts").select("slug, updated_at").eq("status", "published"),
      supabase.from("case_studies").select("slug").eq("status", "published"),
    ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/cart`, changeFrequency: "weekly", priority: 0.3 },
  ];

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const casePages: MetadataRoute.Sitemap = (cases ?? []).map((c) => ({
    url: `${SITE_URL}/services/case/${c.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...blogPages, ...casePages];
}
