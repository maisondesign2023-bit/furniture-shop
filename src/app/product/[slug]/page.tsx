import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createPublicSupabase } from "@/lib/supabase/public";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";
import type { Product } from "@/types";
import { buildMetadata, productJsonLd } from "@/lib/seo";

export const revalidate = 3600;

async function getProduct(slug: string) {
  const supabase = createPublicSupabase();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), categories(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data as Product | null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return {};
  return buildMetadata({
    title: product.seo_title || product.name,
    description:
      product.seo_description ||
      product.description?.slice(0, 150) ||
      product.name,
    path: `/product/${product.slug}`,
    image: product.product_images?.[0]?.url,
  });
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const images = (product!.product_images || []).sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const jsonLd = productJsonLd({
    name: product!.name,
    description: product!.description,
    price: product!.price,
    images: images.map((i) => i.url),
    slug: product!.slug,
    inStock: product!.stock > 0,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* 結構化資料，利於 Google 商品搜尋/圖片搜尋收錄 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-8 font-mono text-xs text-muted">
        首頁 / {product!.categories?.name ?? "商品"} / {product!.name}
      </nav>

      <div className="grid gap-12 md:grid-cols-2">
        <ProductGallery images={images} productName={product!.name} />

        <div>
          <h1 className="font-display text-3xl italic text-walnut">
            {product!.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <p className="font-mono text-2xl tracking-wide2 text-walnut">
              NT$ {product!.price.toLocaleString()}
            </p>
            {product!.compare_at_price && (
              <p className="font-mono text-sm text-muted line-through">
                NT$ {product!.compare_at_price.toLocaleString()}
              </p>
            )}
          </div>

          <p className="mt-2 font-mono text-xs text-muted">
            {product!.stock > 0 ? `現貨 ${product!.stock} 件` : "缺貨中"}
          </p>

          <div className="grain-divider my-8" />

          <div className="mt-8">
            <AddToCartButton
              productId={product!.id}
              name={product!.name}
              slug={product!.slug}
              price={product!.price}
              image={images[0]?.url ?? null}
              sizes={product!.sizes}
              colors={product!.colors}
            />
          </div>

          <div className="mt-10 space-y-4 font-body text-sm leading-relaxed text-ink">
            <h2 className="font-display text-lg not-italic text-walnut">商品敘述</h2>
            <p className="whitespace-pre-line">{product!.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
