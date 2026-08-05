"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";
import { slugify } from "@/lib/slugify";
import type { Category } from "@/types";

export default function CategoryEditForm({
  category,
  topLevelCategories,
  hasChildren,
}: {
  category: Category;
  topLevelCategories: Category[];
  hasChildren: boolean;
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

    const { error: updateError } = await supabase
      .from("categories")
      .update({
        name,
        slug: slugify((form.get("slug") as string) || name, "category"),
        parent_id: hasChildren ? null : (form.get("parent_id") as string) || null,
        sort_order: Number(form.get("sort_order") || 0),
        seo_title: form.get("seo_title") || null,
        seo_description: form.get("seo_description") || null,
      })
      .eq("id", category.id);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6 font-body text-sm">
      <Field label="分類名稱">
        <input name="name" defaultValue={category.name} required className="input" />
      </Field>
      <Field label="網址代稱 slug（英文/數字，會自動轉換格式）">
        <input name="slug" defaultValue={category.slug} className="input" />
      </Field>
      {hasChildren ? (
        <p className="font-mono text-xs text-muted">此分類底下已有子分類，維持為頂層分類。</p>
      ) : (
        <Field label="上層分類">
          <select name="parent_id" defaultValue={category.parent_id ?? ""} className="input">
            <option value="">無（頂層分類）</option>
            {topLevelCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
      )}
      <Field label="排序">
        <input name="sort_order" type="number" defaultValue={category.sort_order} className="input" />
      </Field>

      <div className="border-t border-line pt-6">
        <p className="mb-4 font-mono text-xs text-muted">SEO 設定（選填，留空會用分類名稱）</p>
        <Field label="SEO 標題">
          <input name="seo_title" defaultValue={category.seo_title ?? ""} className="input" />
        </Field>
        <Field label="SEO 描述">
          <textarea name="seo_description" defaultValue={category.seo_description ?? ""} rows={2} className="input" />
        </Field>
      </div>

      {error && <p className="text-red-700">{error}</p>}

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={saving}
          className="bg-walnut px-6 py-3 tracking-wide2 text-surface hover:bg-brass disabled:opacity-50"
        >
          {saving ? "儲存中…" : "儲存變更"}
        </button>

        <DeleteCategoryButton
          categoryId={category.id}
          categoryName={category.name}
          onDeleted={() => {
            router.push("/admin/categories");
            router.refresh();
          }}
        />
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #E2DED8;
          background: #F7F6F4;
          padding: 0.75rem 1rem;
        }
        .input:focus {
          border-color: #9c7a4f;
          outline: none;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}
