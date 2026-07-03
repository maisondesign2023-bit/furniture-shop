import { createServerSupabase } from "@/lib/supabase/server";
import type { ProductShelf } from "@/types";
import ShelfCreateForm from "@/components/admin/ShelfCreateForm";
import Link from "next/link";

export default async function AdminShelvesPage() {
  const supabase = createServerSupabase();
  const { data: shelves } = await supabase
    .from("product_shelves")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <h1 className="font-display text-2xl italic text-walnut">商品貨架管理</h1>
      <p className="mt-2 font-body text-sm text-muted">
        首頁會依「排序」由小到大顯示前兩個啟用中的貨架。點進貨架可以選要放哪些商品。
      </p>

      <div className="mt-8">
        <ShelfCreateForm />
      </div>

      <div className="mt-10 space-y-3">
        {(shelves as ProductShelf[] | null)?.map((s) => (
          <Link
            key={s.id}
            href={`/admin/shelves/${s.id}`}
            className="flex items-center justify-between border border-line p-4 font-body text-sm hover:border-brass"
          >
            <span>{s.title}</span>
            <span className="font-mono text-xs text-muted">
              排序 {s.sort_order} · {s.is_active ? "啟用中" : "已停用"} → 管理商品
            </span>
          </Link>
        ))}
        {(!shelves || shelves.length === 0) && (
          <p className="font-body text-sm text-muted">尚未建立貨架。</p>
        )}
      </div>
    </div>
  );
}
