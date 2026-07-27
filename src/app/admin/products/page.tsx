import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import AdminProductTable from "@/components/admin/AdminProductTable";

export const runtime = "edge";

export default async function AdminProductsPage() {
  const supabase = createServerSupabase();
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name), profiles(full_name)")
    .order("sort_order")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-walnut">商品管理</h1>
        <Link
          href="/admin/products/new"
          className="bg-walnut px-5 py-2.5 font-body text-sm text-surface hover:bg-brass"
        >
          + 新增商品
        </Link>
      </div>
      <p className="mt-2 font-mono text-xs text-muted">
        拖曳左側圖示可調整商品在分類頁的顯示順序。
      </p>

      <AdminProductTable initialProducts={products ?? []} />
    </div>
  );
}
