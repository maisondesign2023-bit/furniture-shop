import { createPublicSupabase } from "@/lib/supabase/public";
import type { SitePage } from "@/types";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "運送與退換貨",
  description: "運送方式、運費計算與退換貨政策說明。",
  path: "/policy/shipping",
});

export const revalidate = 3600;

export default async function ShippingPolicyPage() {
  const supabase = createPublicSupabase();
  const { data: page } = await supabase
    .from("site_pages")
    .select("*")
    .eq("slug", "shipping-policy")
    .single();

  const content = (page as SitePage | null)?.content;

  return (
    <div className="mx-auto max-w-2xl px-6 py-14 font-body text-sm leading-relaxed">
      <h1 className="font-display text-2xl italic text-walnut">
        {(page as SitePage | null)?.title || "運送與退換貨"}
      </h1>
      <div className="grain-divider my-8" />
      <div className="whitespace-pre-line text-ink">
        {content || "尚未設定內容，請至後台「頁面內容管理」編輯。"}
      </div>
    </div>
  );
}
