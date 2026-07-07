import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Product } from "@/types";

export const runtime = "edge";

export default async function AdminProductsPage() {
  const supabase = createServerSupabase();
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name), profiles(full_name)")
    .order("created_at", { ascending: false });

  const statusLabel: Record<string, string> = {
    draft: "草稿",
    published: "已上架",
    archived: "已下架",
  };

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

      <table className="mt-8 w-full font-body text-sm">
        <thead>
          <tr className="border-b border-line text-left font-mono text-xs text-muted">
            <th className="py-3">商品名稱</th>
            <th>分類</th>
            <th>價格</th>
            <th>庫存</th>
            <th>狀態</th>
            <th>上架人員</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(products as any[] | null)?.map((p) => (
            <tr key={p.id} className="border-b border-line">
              <td className="py-3">{p.name}</td>
              <td>{p.categories?.name ?? "—"}</td>
              <td className="font-mono">NT$ {p.price.toLocaleString()}</td>
              <td className="font-mono">{p.stock}</td>
              <td>{statusLabel[p.status]}</td>
              <td className="font-mono text-xs text-muted">
                {p.profiles?.full_name || "—"}
              </td>
              <td>
                <Link
                  href={`/admin/products/${p.id}`}
                  className="font-mono text-xs text-brass hover:underline"
                >
                  編輯
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
