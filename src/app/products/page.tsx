import Link from "next/link";
import type { Metadata } from "next";
import { createPublicSupabase } from "@/lib/supabase/public";
import ProductCard from "@/components/ProductCard";
import CategorySidebar from "@/components/CategorySidebar";
import type { Category, Product } from "@/types";
import { buildMetadata } from "@/lib/seo";

export const runtime = "edge";

// 這頁流量高、分類會常常異動，改成每次都抓最新資料，確保後台編輯完前台馬上看得到
export const revalidate = 0;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { category?: string };
}): Promise<Metadata> {
  const slug = searchParams?.category;
  if (!slug) {
    return buildMetadata({ title: "全部商品", description: "瀏覽所有家具商品。", path: "/products" });
  }
  const supabase = createPublicSupabase();
  const { data: category } = await supabase.from("categories").select("*").eq("slug", slug).single();
  if (!category) {
    return buildMetadata({ title: "全部商品", description: "瀏覽所有家具商品。", path: "/products" });
  }
  return buildMetadata({
    title: category.seo_title || category.name,
    description: category.seo_description || `瀏覽${category.name}分類的所有家具商品。`,
    path: `/products?category=${category.slug}`,
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const supabase = createPublicSupabase();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");
  const categoryList = (categories as Category[]) ?? [];

  const selectedSlug = searchParams?.category;
  const selected = selectedSlug ? categoryList.find((c) => c.slug === selectedSlug) : undefined;

  let productQuery = supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("status", "published");

  if (selected) {
    const childIds = categoryList.filter((c) => c.parent_id === selected.id).map((c) => c.id);
    productQuery = productQuery.in("category_id", [selected.id, ...childIds]);
  }

  const { data: products } = await productQuery
    .order("sort_order")
    .order("created_at", { ascending: false });

  const parentOfSelected = selected?.parent_id
    ? categoryList.find((c) => c.id === selected.parent_id)
    : undefined;

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <nav className="mb-6 font-mono text-xs text-muted">
        <Link href="/" className="hover:text-brass">首頁</Link>
        <span className="mx-2">›</span>
        {selected ? (
          <>
            {parentOfSelected && (
              <>
                <Link href={`/products?category=${parentOfSelected.slug}`} className="hover:text-brass">
                  {parentOfSelected.name}
                </Link>
                <span className="mx-2">›</span>
              </>
            )}
            <span className="text-ink">{selected.name}</span>
          </>
        ) : (
          <span className="text-ink">全部商品</span>
        )}
      </nav>

      <div className="flex flex-col gap-10 md:flex-row">
        <CategorySidebar categories={categoryList} selectedSlug={selectedSlug} />

        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold text-walnut">
            {selected ? selected.name : "全部商品"}
          </h1>
          <p className="mt-2 font-mono text-xs text-muted">共 {products?.length ?? 0} 項商品</p>
          <div className="grain-divider my-6" />

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
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
      </div>
    </div>
  );
}
