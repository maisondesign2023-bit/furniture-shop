"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import type { Category } from "@/types";

export default function CategoryCreateForm({
  topLevelCategories,
}: {
  topLevelCategories: Category[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string) || "";
    const slugInput = (form.get("slug") as string) || "";

    const { error: insertError } = await supabase.from("categories").insert({
      name,
      slug: slugify(slugInput || name, "category"),
      parent_id: (form.get("parent_id") as string) || null,
      sort_order: Number(form.get("sort_order") || 0),
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
      className="flex max-w-3xl flex-wrap items-end gap-3 border border-line p-6 font-body text-sm"
    >
      <label className="flex-1 basis-40">
        <span className="mb-1 block font-mono text-xs text-muted">分類名稱</span>
        <input
          name="name"
          required
          placeholder="例如：客廳家具"
          className="w-full border border-line bg-surface px-4 py-3"
        />
      </label>
      <label className="flex-1 basis-40">
        <span className="mb-1 block font-mono text-xs text-muted">網址代稱 slug（選填，留空自動產生）</span>
        <input
          name="slug"
          placeholder="留空會用分類名稱自動產生"
          className="w-full border border-line bg-surface px-4 py-3"
        />
      </label>
      <label className="w-40">
        <span className="mb-1 block font-mono text-xs text-muted">上層分類</span>
        <select name="parent_id" defaultValue="" className="w-full border border-line bg-surface px-4 py-3">
          <option value="">無（頂層分類）</option>
          {topLevelCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      <label className="w-24">
        <span className="mb-1 block font-mono text-xs text-muted">排序</span>
        <input name="sort_order" type="number" defaultValue={0} className="w-full border border-line bg-surface px-4 py-3" />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="bg-walnut px-6 py-3 tracking-wide2 text-surface hover:bg-brass disabled:opacity-50"
      >
        {saving ? "建立中…" : "新增分類"}
      </button>
      {error && <p className="w-full text-red-700">{error}</p>}
    </form>
  );
}
