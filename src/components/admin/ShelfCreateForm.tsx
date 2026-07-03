"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ShelfCreateForm() {
  const supabase = createClient();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    const { error: insertError } = await supabase.from("product_shelves").insert({
      title: form.get("title"),
      sort_order: Number(form.get("sort_order") || 0),
      is_active: true,
    });

    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-xl items-end gap-3 border border-line p-6 font-body text-sm"
    >
      <label className="flex-1">
        <span className="mb-1 block font-mono text-xs text-muted">貨架名稱</span>
        <input
          name="title"
          required
          placeholder="例如：熱銷商品"
          className="w-full border border-line bg-surface px-4 py-3"
        />
      </label>
      <label className="w-24">
        <span className="mb-1 block font-mono text-xs text-muted">排序</span>
        <input
          name="sort_order"
          type="number"
          defaultValue={0}
          className="w-full border border-line bg-surface px-4 py-3"
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="bg-walnut px-6 py-3 tracking-wide2 text-surface hover:bg-brass disabled:opacity-50"
      >
        {saving ? "建立中…" : "新增貨架"}
      </button>
      {error && <p className="text-red-700">{error}</p>}
    </form>
  );
}
