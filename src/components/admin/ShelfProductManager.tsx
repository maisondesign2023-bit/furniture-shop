"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Product, ShelfProduct } from "@/types";

export default function ShelfProductManager({
  shelfId,
  allProducts,
  initialShelfProducts,
}: {
  shelfId: string;
  allProducts: Product[];
  initialShelfProducts: ShelfProduct[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const selectedIds = new Set(initialShelfProducts.map((sp) => sp.product_id));
  const availableProducts = allProducts.filter((p) => !selectedIds.has(p.id));

  async function addProduct(productId: string) {
    setBusy(true);
    await supabase.from("shelf_products").insert({
      shelf_id: shelfId,
      product_id: productId,
      sort_order: initialShelfProducts.length,
    });
    setBusy(false);
    router.refresh();
  }

  async function removeProduct(shelfProductId: string) {
    setBusy(true);
    await supabase.from("shelf_products").delete().eq("id", shelfProductId);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h2 className="font-mono text-xs text-muted mb-3">貨架裡目前的商品（{initialShelfProducts.length}）</h2>
        <div className="space-y-2">
          {initialShelfProducts.map((sp) => (
            <div
              key={sp.id}
              className="flex items-center justify-between border border-line px-4 py-3 font-body text-sm"
            >
              <span>{sp.products?.name}</span>
              <button
                disabled={busy}
                onClick={() => removeProduct(sp.id)}
                className="font-mono text-xs text-red-700 hover:underline disabled:opacity-50"
              >
                移除
              </button>
            </div>
          ))}
          {initialShelfProducts.length === 0 && (
            <p className="font-body text-sm text-muted">尚未加入任何商品。</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-mono text-xs text-muted mb-3">可加入的商品</h2>
        <div className="max-h-[28rem] space-y-2 overflow-y-auto">
          {availableProducts.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between border border-line px-4 py-3 font-body text-sm"
            >
              <span>{p.name}</span>
              <button
                disabled={busy}
                onClick={() => addProduct(p.id)}
                className="font-mono text-xs text-brass hover:underline disabled:opacity-50"
              >
                加入貨架
              </button>
            </div>
          ))}
          {availableProducts.length === 0 && (
            <p className="font-body text-sm text-muted">沒有其他可加入的已上架商品。</p>
          )}
        </div>
      </div>
    </div>
  );
}
