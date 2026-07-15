import Link from "next/link";
import Image from "next/image";
import { createPublicSupabase } from "@/lib/supabase/public";
import ProductCard from "@/components/ProductCard";
import type { Product, Banner, ProductShelf, ShelfProduct, BlogPost } from "@/types";
import { buildMetadata } from "@/lib/seo";

export const runtime = "edge";

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80";

export const metadata = buildMetadata({
  title: "首頁",
  description: "職人工藝、質感簡約的家具選物，為你的空間找到合適的一件。",
  path: "/",
});

// 這頁流量低，改成每次都抓最新資料，確保後台編輯完前台馬上看得到
export const revalidate = 0;

export default async function HomePage() {
  const supabase = createPublicSupabase();

  const [{ data: heroBanners }, { data: dividerBanners }, { data: shelves }, { data: posts }] =
    await Promise.all([
      supabase
        .from("banners")
        .select("*")
        .eq("type", "hero")
        .eq("is_active", true)
        .order("sort_order")
        .limit(1),
      supabase
        .from("banners")
        .select("*")
        .eq("type", "divider")
        .eq("is_active", true)
        .order("sort_order")
        .limit(2),
      supabase
        .from("product_shelves")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .limit(2),
      supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3),
    ]);

  const hero = (heroBanners as Banner[] | null)?.[0];
  const dividers = (dividerBanners as Banner[]) ?? [];
  const shelfList = (shelves as ProductShelf[]) ?? [];

  // 兩個貨架的商品合併成一次查詢，減少重複連線與資料解析的成本
  const shelfIds = shelfList.map((s) => s.id);
  const { data: allShelfProducts } =
    shelfIds.length > 0
      ? await supabase
          .from("shelf_products")
          .select("*, products(*, product_images(*))")
          .in("shelf_id", shelfIds)
          .order("sort_order")
      : { data: [] as ShelfProduct[] };

  const shelfProductsById = (id: string) =>
    ((allShelfProducts as ShelfProduct[]) ?? []).filter((sp) => sp.shelf_id === id);

  return (
    <div>
      {/* 最新消息 */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-14 md:pt-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide2 text-brass">
              Furniture &amp; Living
            </p>
            <h1 className="mt-4 whitespace-pre-line font-display text-4xl font-semibold leading-tight text-walnut md:text-5xl">
              {hero?.title || "為每個空間，\n找到合適的重量。"}
            </h1>
            <p className="mt-6 max-w-md font-body text-muted">
              {hero?.subtitle ||
                "從選材到工序，我們相信家具是空間裡最誠實的存在。瀏覽分類，找到屬於你的那一件。"}
            </p>
            <Link
              href={hero?.link_url || "/category/living-room"}
              className="mt-8 inline-block border border-walnut px-6 py-3 font-body text-sm tracking-wide2 text-walnut transition hover:bg-walnut hover:text-surface"
            >
              開始選購
            </Link>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
            <Image
              src={hero?.image_url || FALLBACK_BANNER}
              alt={hero?.title || "質感簡約的客廳家具陳列"}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 分隔圖片 1 */}
      {dividers[0] && <DividerImage banner={dividers[0]} />}

      {/* 商品貨架 1 */}
      {shelfList[0] && (
        <ProductShelfSection
          shelf={shelfList[0]}
          items={shelfProductsById(shelfList[0].id)}
        />
      )}

      {/* 分隔圖片 2 */}
      {dividers[1] && <DividerImage banner={dividers[1]} />}

      {/* 商品貨架 2 */}
      {shelfList[1] && (
        <ProductShelfSection
          shelf={shelfList[1]}
          items={shelfProductsById(shelfList[1].id)}
        />
      )}

      {/* 分隔線 */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="grain-divider" />
      </div>

      {/* 部落格 */}
      <BlogSection posts={(posts as BlogPost[]) ?? []} />
    </div>
  );
}

function DividerImage({ banner }: { banner: Banner }) {
  const image = (
    <div className="relative h-40 w-full overflow-hidden bg-surface md:h-56">
      <Image
        src={banner.image_url}
        alt={banner.title || "分隔圖片"}
        fill
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
  return banner.link_url ? <Link href={banner.link_url}>{image}</Link> : image;
}

function ProductShelfSection({
  shelf,
  items,
}: {
  shelf: ProductShelf;
  items: ShelfProduct[] | null;
}) {
  const products = (items ?? [])
    .map((i) => i.products)
    .filter((p): p is Product => Boolean(p));

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-center font-display text-2xl font-semibold text-walnut">
        {shelf.title}
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {shelf.link_url && (
        <div className="mt-10 text-center">
          <Link
            href={shelf.link_url}
            className="inline-block bg-walnut px-8 py-3 font-body text-sm tracking-wide2 text-surface hover:bg-brass"
          >
            查看更多
          </Link>
        </div>
      )}
    </section>
  );
}

function BlogSection({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;
  const [featured, ...rest] = posts;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="font-display text-2xl font-semibold text-walnut">探索更多</h2>

      <div className="mt-8 grid gap-10 md:grid-cols-2">
        <Link href={`/blog/${featured.slug}`} className="group block">
          <div className="relative aspect-[16/10] overflow-hidden bg-surface">
            {featured.cover_image && (
              <Image
                src={featured.cover_image}
                alt={featured.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
          </div>
          <h3 className="mt-4 font-display text-xl font-semibold text-walnut">
            {featured.title}
          </h3>
          {featured.excerpt && (
            <p className="mt-2 font-body text-sm text-muted line-clamp-2">
              {featured.excerpt}
            </p>
          )}
        </Link>

        <div className="grid gap-6">
          {rest.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group flex gap-4">
              <div className="relative h-24 w-32 shrink-0 overflow-hidden bg-surface">
                {post.cover_image && (
                  <Image
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    sizes="128px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-walnut">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-1 font-body text-xs text-muted line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Link
        href="/blog"
        className="mt-8 inline-block font-mono text-xs text-brass hover:underline"
      >
        查看全部文章 →
      </Link>
    </section>
  );
}
