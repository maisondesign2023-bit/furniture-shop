import { createPublicSupabase } from "@/lib/supabase/public";
import type { SitePage } from "@/types";
import { buildMetadata } from "@/lib/seo";

export const runtime = "edge";

export const metadata = buildMetadata({
  title: "隱私權政策",
  description: "個人資料蒐集、使用與保護說明。",
  path: "/policy/privacy",
});

// 這頁流量低，改成每次都抓最新資料，確保後台編輯完前台馬上看得到
export const revalidate = 0;

export default async function PrivacyPolicyPage() {
  const supabase = createPublicSupabase();
  const { data: page } = await supabase
    .from("site_pages")
    .select("*")
    .eq("slug", "privacy-policy")
    .single();

  const content = (page as SitePage | null)?.content;

  return (
    <div className="mx-auto max-w-2xl px-6 py-14 font-body text-sm leading-relaxed">
      <h1 className="font-display text-2xl font-semibold text-walnut">
        {(page as SitePage | null)?.title || "隱私權政策"}
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
