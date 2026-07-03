export const runtime = "edge";

import { createServerSupabase } from "@/lib/supabase/server";
import type { SitePage } from "@/types";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "隱私權政策",
  description: "個人資料蒐集、使用與保護說明。",
  path: "/policy/privacy",
});

export const revalidate = 3600;

export default async function PrivacyPolicyPage() {
  const supabase = createServerSupabase();
  const { data: page } = await supabase
    .from("site_pages")
    .select("*")
    .eq("slug", "privacy-policy")
    .single();

  const content = (page as SitePage | null)?.content;

  return (
    <div className="mx-auto max-w-2xl px-6 py-14 font-body text-sm leading-relaxed">
      <h1 className="font-display text-2xl italic text-walnut">
        {(page as SitePage | null)?.title || "隱私權政策"}
      </h1>
      <div className="grain-divider my-8" />
      <div className="whitespace-pre-line text-ink">
        {content || "尚未設定內容，請至後台「頁面內容管理」編輯。"}
      </div>
    </div>
  );
}
