import { createServerSupabase } from "@/lib/supabase/server";
import type { ProductShelf } from "@/types";
import ShelfCreateForm from "@/components/admin/ShelfCreateForm";
import ShelfList from "@/components/admin/ShelfList";

export const runtime = "edge";

export default async function AdminShelvesPage() {
  const supabase = createServerSupabase();
  const { data: shelves } = await supabase
    .from("product_shelves")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-walnut">商品貨架管理</h1>
      <p className="mt-2 font-body text-sm text-muted">
        首頁會依順序顯示前兩個啟用中的貨架。拖曳左側圖示可調整順序，點進貨架可以選要放哪些商品。
      </p>

      <div className="mt-8">
        <ShelfCreateForm />
      </div>

      <div className="mt-10">
        <ShelfList initialShelves={(shelves as ProductShelf[]) ?? []} />
      </div>
    </div>
  );
}
