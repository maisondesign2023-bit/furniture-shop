import { createServerSupabase } from "@/lib/supabase/server";
import type { Banner } from "@/types";
import BannerForm from "@/components/admin/BannerForm";
import BannerList from "@/components/admin/BannerList";

export default async function AdminBannersPage() {
  const supabase = createServerSupabase();
  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <h1 className="font-display text-2xl italic text-walnut">首頁圖片管理</h1>
      <p className="mt-2 font-body text-sm text-muted">
        管理首頁最上方的主視覺圖片。啟用中的第一張會顯示在首頁，可設定標題、副標與點擊連結。
      </p>

      <div className="mt-8">
        <BannerForm />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg italic text-walnut">目前的圖片</h2>
        <BannerList banners={(banners as Banner[]) ?? []} />
      </div>
    </div>
  );
}
