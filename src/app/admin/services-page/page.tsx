import { createServerSupabase } from "@/lib/supabase/server";
import type { ServicePageImage } from "@/types";
import ServicePageImageManager from "@/components/admin/ServicePageImageManager";

export const runtime = "edge";

export default async function AdminServicesPagePage() {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("service_page_images")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-walnut">家配師服務頁面圖片</h1>
      <p className="mt-2 font-body text-sm text-muted">
        管理「家配師服務」頁面的 Hero 大圖與四個服務區塊的圖庫，上傳、刪除、拖曳排序都會立即生效。
      </p>
      <div className="mt-10">
        <ServicePageImageManager initialImages={(data as ServicePageImage[]) ?? []} />
      </div>
    </div>
  );
}
