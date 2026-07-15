"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteShelfButton({
  shelfId,
  shelfTitle,
}: {
  shelfId: string;
  shelfTitle: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`確定要刪除「${shelfTitle}」這個貨架嗎？此動作無法復原。`)) return;
    setDeleting(true);
    await supabase.from("product_shelves").delete().eq("id", shelfId);
    router.refresh();
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
