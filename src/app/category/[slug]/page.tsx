import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createPublicSupabase } from "@/lib/supabase/public";
import ProductCard from "@/components/ProductCard";
import type { Category, Product } from "@/types";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

async function getCategory(slug: string) {
  const supabase = createPublicSupabase();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();
  return data as Category | null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await getCategory(params.slug);
  if (!category) return {};
  return buildMetadata({
    title: category.seo_title || category.name,
    description:
      category.seo_description || `瀏覽${category.name}分類的所有家具商品。`,
    path: `/category/${category.slug}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await getCategory(params.slug);
  if (!category) notFound();

  const supabase = createPublicSupabase();
  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("status", "published")
    .eq("category_id", category!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="font-display text-3xl italic text-walnut">{category!.name}</h1>
      <div className="grain-divider my-8" />

      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {(products as Product[] | null)?.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {(!products || products.length === 0) && (
          <p className="col-span-full font-body text-sm text-muted">
            此分類目前沒有上架商品。
          </p>
        )}
      </div>
    </div>
  );
}
