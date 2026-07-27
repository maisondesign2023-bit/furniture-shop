"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SortableRowList from "@/components/admin/SortableRowList";
import DeleteShelfButton from "@/components/admin/DeleteShelfButton";
import type { ProductShelf } from "@/types";

export default function ShelfList({ initialShelves }: { initialShelves: ProductShelf[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [shelves, setShelves] = useState(initialShelves);

  async function handleReorder(reordered: ProductShelf[]) {
    setShelves(reordered);
    for (let i = 0; i < reordered.length; i++) {
      const { error } = await supabase
        .from("product_shelves")
        .update({ sort_order: i })
        .eq("id", reordered[i].id);
      if (error) {
        alert(`排序更新失敗：${error.message}\n請重新整理頁面再試一次。`);
        router.refresh();
        return;
      }
    }
  }

  if (shelves.length === 0) {
    return <p className="font-body text-sm text-muted">尚未建立貨架。</p>;
  }

  return (
    <SortableRowList
      items={shelves}
      onReorder={handleReorder}
      renderItem={(s) => (
        <div className="flex items-center justify-between border border-line p-4 font-body text-sm">
          <span>{s.title}</span>
          <div className="flex items-center gap-5">
            <span className="font-mono text-xs text-muted">
              {s.is_active ? "啟用中" : "已停用"}
            </span>
            <Link
              href={`/admin/shelves/${s.id}`}
              className="font-mono text-xs text-brass hover:underline"
            >
              編輯 / 管理商品 →
            </Link>
            <DeleteShelfButton shelfId={s.id} shelfTitle={s.title} />
          </div>
        </div>
      )}
    />
  );
}
