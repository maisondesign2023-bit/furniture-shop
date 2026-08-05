"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
  onDeleted,
}: {
  categoryId: string;
  categoryName: string;
  onDeleted?: () => void;
}) {
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `確定要刪除「${categoryName}」這個分類嗎？\n此分類底下的商品不會被刪除，只會變成未分類；若底下還有子分類，子分類會變成頂層分類。`
      )
    )
      return;
    setDeleting(true);
    const { error } = await supabase.from("categories").delete().eq("id", categoryId);
    setDeleting(false);
    if (error) {
      alert(`刪除失敗：${error.message}`);
      return;
    }
    onDeleted?.();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="font-mono text-xs text-red-700 hover:underline disabled:opacity-50"
    >
      {deleting ? "刪除中…" : "刪除"}
    </button>
  );
}
