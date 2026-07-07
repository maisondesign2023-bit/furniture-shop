import Link from "next/link";
import { createPublicSupabase } from "@/lib/supabase/public";
import CartBadge from "@/components/CartBadge";
import AuthStatus from "@/components/AuthStatus";
import type { Category, BlogPost, CaseStudy } from "@/types";

export default async function Header() {
  const supabase = createPublicSupabase();

  const [{ data: categories }, { data: posts }, { data: cases }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(5),
    supabase
      .from("case_studies")
      .select("*")
      .eq("status", "published")
      .order("sort_order")
      .limit(5),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-xl italic text-walnut">
          木・室
        </Link>

        <nav className="hidden gap-8 font-body text-sm tracking-wide2 text-ink md:flex">
          {/* 商品分類：下拉顯示分類 */}
          <div className="group relative">
            <button className="flex items-center gap-1 py-2 hover:text-brass">
              商品分類
              <Caret />
            </button>
            <div className="invisible absolute left-0 top-full w-48 border border-line bg-surface opacity-0 shadow-sm transition group-hover:visible group-hover:opacity-100">
              {(categories as Category[] | null)?.map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="block px-4 py-3 text-sm hover:bg-paper hover:text-brass"
                >
                  {c.name}
                </Link>
              ))}
              {(!categories || categories.length === 0) && (
                <p className="px-4 py-3 text-xs text-muted">尚未建立分類</p>
              )}
            </div>
          </div>

          <Link href="/activities" className="py-2 hover:text-brass">
            最新活動
          </Link>

          {/* 探索更多：下拉顯示部落格文章 */}
          <div className="group relative">
            <button className="flex items-center gap-1 py-2 hover:text-brass">
              探索更多
              <Caret />
            </button>
            <div className="invisible absolute left-0 top-full w-64 border border-line bg-surface opacity-0 shadow-sm transition group-hover:visible group-hover:opacity-100">
              {(posts as BlogPost[] | null)?.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="block px-4 py-3 text-sm hover:bg-paper hover:text-brass"
                >
                  {p.title}
                </Link>
              ))}
              {(!posts || posts.length === 0) && (
                <p className="px-4 py-3 text-xs text-muted">尚未發布文章</p>
              )}
              <Link
                href="/blog"
                className="block border-t border-line px-4 py-3 font-mono text-xs text-brass"
              >
                查看全部文章 →
              </Link>
            </div>
          </div>

          <Link href="/about" className="py-2 hover:text-brass">
            關於我們
          </Link>

          {/* 家配師服務：下拉顯示過去案例 */}
          <div className="group relative">
            <button className="flex items-center gap-1 py-2 hover:text-brass">
              家配師服務
              <Caret />
            </button>
            <div className="invisible absolute right-0 top-full w-64 border border-line bg-surface opacity-0 shadow-sm transition group-hover:visible group-hover:opacity-100">
              {(cases as CaseStudy[] | null)?.map((c) => (
                <Link
                  key={c.id}
                  href={`/services/case/${c.slug}`}
                  className="block px-4 py-3 text-sm hover:bg-paper hover:text-brass"
                >
                  {c.title}
                </Link>
              ))}
              {(!cases || cases.length === 0) && (
                <p className="px-4 py-3 text-xs text-muted">尚未發布案例</p>
              )}
              <Link
                href="/services"
                className="block border-t border-line px-4 py-3 font-mono text-xs text-brass"
              >
                服務介紹與預約諮詢 →
              </Link>
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-5 font-body text-sm">
          <Link href="/account" className="hover:text-brass">會員</Link>
          <AuthStatus />
          <Link href="/cart" className="relative hover:text-brass">
            購物車
            <CartBadge />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Caret() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" className="mt-0.5">
      <path d="M1 3l4 4 4-4" stroke="currentColor" fill="none" strokeWidth="1.3" />
    </svg>
  );
}
