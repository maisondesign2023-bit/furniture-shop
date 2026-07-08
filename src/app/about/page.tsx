import { createPublicSupabase } from "@/lib/supabase/public";
import type { SitePage } from "@/types";
import { buildMetadata } from "@/lib/seo";

export const runtime = "edge";

export const metadata = buildMetadata({
  title: "關於我們",
  description: "了解我們的品牌故事與工藝理念。",
  path: "/about",
});

export const revalidate = 3600;

export default async function AboutPage() {
  const supabase = createPublicSupabase();
  const { data: page } = await supabase
    .from("site_pages")
    .select("*")
    .eq("slug", "about")
    .single();

  const content = (page as SitePage | null)?.content;

  return (
    <div className="mx-auto max-w-2xl px-6 py-14 font-body text-sm leading-relaxed">
      <h1 className="font-display text-2xl font-semibold text-walnut">
        {(page as SitePage | null)?.title || "關於我們"}
      </h1>
      <div className="grain-divider my-8" />
      {content ? (
        <div className="rich-content" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <p className="text-ink">尚未設定內容，請至後台「頁面內容管理」編輯。</p>
      )}
    </div>
  );
}
