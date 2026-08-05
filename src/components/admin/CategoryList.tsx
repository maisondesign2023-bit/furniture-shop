"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SortableRowList from "@/components/admin/SortableRowList";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";
import type { Category } from "@/types";

export default function CategoryList({ initialCategories }: { initialCategories: Category[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);

  const topLevel = categories
    .filter((c) => !c.parent_id)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);

  function childrenOf(parentId: string) {
    return categories
      .filter((c) => c.parent_id === parentId)
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  async function handleReorder(reordered: Category[]) {
    const updated = reordered.map((c, i) => ({ ...c, sort_order: i }));
    setCategories((prev) => {
      const updatedIds = new Set(updated.map((c) => c.id));
      const rest = prev.filter((c) => !updatedIds.has(c.id));
      return [...rest, ...updated];
    });
    for (let i = 0; i < updated.length; i++) {
      const { error } = await supabase.from("categories").update({ sort_order: i }).eq("id", updated[i].id);
      if (error) {
        alert(`排序更新失敗：${error.message}\n請重新整理頁面再試一次。`);
        router.refresh();
        return;
      }
    }
  }

  function handleDeleted(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id && c.parent_id !== id));
    router.refresh();
  }

  if (topLevel.length === 0) {
    return <p className="font-body text-sm text-muted">尚未建立分類。</p>;
  }

  return (
    <SortableRowList
      items={topLevel}
      onReorder={handleReorder}
      renderItem={(c) => {
        const children = childrenOf(c.id);
        return (
          <div>
            <div className="flex items-center justify-between border border-line p-4 font-body text-sm">
              <span>{c.name}</span>
              <div className="flex items-center gap-5">
                <span className="font-mono text-xs text-muted">/{c.slug}</span>
                <Link href={`/admin/categories/${c.id}`} className="font-mono text-xs text-brass hover:underline">
                  編輯 →
                </Link>
                <DeleteCategoryButton categoryId={c.id} categoryName={c.name} onDeleted={() => handleDeleted(c.id)} />
              </div>
            </div>
            {children.length > 0 && (
              <div className="mt-2 pl-8">
                <SortableRowList
                  items={children}
                  onReorder={handleReorder}
                  renderItem={(child) => (
                    <div className="flex items-center justify-between border border-line bg-surface p-3 font-body text-sm">
                      <span>{child.name}</span>
                      <div className="flex items-center gap-5">
                        <span className="font-mono text-xs text-muted">/{child.slug}</span>
                        <Link href={`/admin/categories/${child.id}`} className="font-mono text-xs text-brass hover:underline">
                          編輯 →
                        </Link>
                        <DeleteCategoryButton
                          categoryId={child.id}
                          categoryName={child.name}
                          onDeleted={() => handleDeleted(child.id)}
                        />
                      </div>
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
