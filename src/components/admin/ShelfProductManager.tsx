"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SortableRowList from "@/components/admin/SortableRowList";
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
  const [items, setItems] = useState(initialShelfProducts);

  useEffect(() => {
    setItems(initialShelfProducts);
  }, [initialShelfProducts]);

  const selectedIds = new Set(items.map((sp) => sp.product_id));
  const availableProducts = allProducts.filter((p) => !selectedIds.has(p.id));

  async function addProduct(productId: string) {
    setBusy(true);
    await supabase.from("shelf_products").insert({
      shelf_id: shelfId,
      product_id: productId,
      sort_order: items.length,
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

  async function handleReorder(reordered: ShelfProduct[]) {
    setItems(reordered);
    for (let i = 0; i < reordered.length; i++) {
      const { error } = await supabase
        .from("shelf_products")
        .update({ sort_order: i })
        .eq("id", reordered[i].id);
      if (error) {
        alert(`排序更新失敗：${error.message}\n請重新整理頁面再試一次。`);
        router.refresh();
        return;
      }
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h2 className="font-mono text-xs text-muted mb-3">
          貨架裡目前的商品（{items.length}，拖曳可調整順序）
        </h2>
        {items.length > 0 ? (
          <SortableRowList
            items={items}
            onReorder={handleReorder}
            renderItem={(sp) => (
              <div className="flex items-center justify-between border border-line px-4 py-3 font-body text-sm">
                <span>{sp.products?.name}</span>
                <button
                  disabled={busy}
                  onClick={() => removeProduct(sp.id)}
                  className="font-mono text-xs text-red-700 hover:underline disabled:opacity-50"
                >
                  移除
                </button>
              </div>
            )}
          />
        ) : (
          <p className="font-body text-sm text-muted">尚未加入任何商品。</p>
        )}
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
