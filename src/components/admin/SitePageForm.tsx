"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { SitePage } from "@/types";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function SitePageForm({ page }: { page: SitePage }) {
  const supabase = createClient();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const form = new FormData(e.currentTarget);

    const { error: updateError } = await supabase
      .from("site_pages")
      .update({
        title: form.get("title"),
        content: form.get("content"),
        updated_at: new Date().toISOString(),
      })
      .eq("id", page.id);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 font-body text-sm">
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-muted">標題</span>
        <input
          name="title"
          defaultValue={page.title}
          required
          className="w-full border border-line bg-surface px-4 py-3"
        />
      </label>
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-muted">內容</span>
        <RichTextEditor name="content" bucket="site-images" initialValue={page.content ?? ""} />
      </label>

      {error && <p className="text-red-700">{error}</p>}
      {saved && <p className="text-brass">已儲存</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-walnut px-6 py-3 tracking-wide2 text-surface hover:bg-brass disabled:opacity-50"
      >
        {saving ? "儲存中…" : "儲存"}
      </button>
    </form>
  );
}
