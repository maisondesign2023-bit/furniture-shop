"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ProductShelf } from "@/types";

export default function ShelfSettingsForm({ shelf }: { shelf: ProductShelf }) {
  const supabase = createClient();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    const { error: updateError } = await supabase
      .from("product_shelves")
      .update({
        title: form.get("title"),
        sort_order: Number(form.get("sort_order") || 0),
        is_active: form.get("is_active") === "on",
      })
      .eq("id", shelf.id);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-4 border border-line p-6 font-body text-sm"
    >
      <p className="font-mono text-xs text-muted">貨架設定</p>
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-muted">貨架名稱</span>
        <input
          name="title"
          defaultValue={shelf.title}
          required
          className="w-full border border-line bg-surface px-4 py-3"
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1 block font-mono text-xs text-muted">排序</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={shelf.sort_order}
            className="w-full border border-line bg-surface px-4 py-3"
          />
        </label>
        <label className="flex items-center gap-2 pt-6">
          <input name="is_active" type="checkbox" defaultChecked={shelf.is_active} />
          <span className="font-mono text-xs text-muted">啟用中</span>
        </label>
      </div>
      {error && <p className="text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-walnut px-6 py-3 tracking-wide2 text-surface hover:bg-brass disabled:opacity-50"
      >
        {saving ? "儲存中…" : "儲存貨架設定"}
      </button>
    </form>
  );
}
