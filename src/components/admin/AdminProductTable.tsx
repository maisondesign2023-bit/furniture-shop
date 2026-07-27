"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Product } from "@/types";

const STATUS_LABEL: Record<string, string> = {
  draft: "草稿",
  published: "已上架",
  archived: "已下架",
};

type Row = Product & {
  categories?: { name: string } | null;
  profiles?: { full_name: string | null } | null;
};

export default function AdminProductTable({ initialProducts }: { initialProducts: Row[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(products, oldIndex, newIndex);
    setProducts(reordered);

    for (let i = 0; i < reordered.length; i++) {
      const { error } = await supabase
        .from("products")
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
    <table className="mt-8 w-full font-body text-sm">
      <thead>
        <tr className="border-b border-line text-left font-mono text-xs text-muted">
          <th className="w-8 py-3"></th>
          <th>商品名稱</th>
          <th>分類</th>
          <th>價格</th>
          <th>庫存</th>
          <th>狀態</th>
          <th>上架人員</th>
          <th></th>
        </tr>
      </thead>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <tbody>
            {products.map((p) => (
              <SortableProductRow key={p.id} product={p} />
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-muted">
                  尚無商品。
                </td>
              </tr>
            )}
          </tbody>
        </SortableContext>
      </DndContext>
    </table>
  );
}

function SortableProductRow({ product: p }: { product: Row }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: p.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-line ${isDragging ? "relative z-10 bg-surface opacity-80" : ""}`}
    >
      <td className="py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none px-1 text-muted active:cursor-grabbing"
          aria-label="拖曳調整順序"
        >
          ⠿
        </button>
      </td>
      <td>{p.name}</td>
      <td>{p.categories?.name ?? "—"}</td>
      <td className="font-mono">
        {p.size_prices && p.size_prices.length > 0
          ? `NT$ ${Math.min(...p.size_prices.map((s) => s.price)).toLocaleString()} 起`
          : `NT$ ${p.price.toLocaleString()}`}
      </td>
      <td className="font-mono">{p.stock}</td>
      <td>{STATUS_LABEL[p.status]}</td>
      <td className="font-mono text-xs text-muted">{p.profiles?.full_name || "—"}</td>
      <td>
        <Link href={`/admin/products/${p.id}`} className="font-mono text-xs text-brass hover:underline">
          編輯
        </Link>
      </td>
    </tr>
  );
}
