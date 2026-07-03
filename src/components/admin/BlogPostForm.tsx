"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BlogPostForm() {
  const supabase = createClient();
  const router = useRouter();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const slug = (form.get("slug") as string) || slugify(title);
    const status = form.get("status") as string;

    try {
      let coverUrl: string | null = null;
      if (coverFile) {
        const path = `${Date.now()}-${coverFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("blog-images")
          .upload(path, coverFile);
        if (uploadError) throw new Error(uploadError.message);
        const { data: publicUrl } = supabase.storage
          .from("blog-images")
          .getPublicUrl(path);
        coverUrl = publicUrl.publicUrl;
      }

      const { error: insertError } = await supabase.from("blog_posts").insert({
        title,
        slug,
        cover_image: coverUrl,
        excerpt: form.get("excerpt"),
        content: form.get("content"),
        status,
        seo_title: form.get("seo_title") || null,
        seo_description: form.get("seo_description") || null,
        published_at: status === "published" ? new Date().toISOString() : null,
      });
      if (insertError) throw new Error(insertError.message);

      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 font-body text-sm">
      <Field label="文章標題">
        <input name="title" required className="input" />
      </Field>
      <Field label="網址代稱 slug（留空自動產生，建議手動填英文，如 living-room-tips）">
        <input name="slug" className="input" />
      </Field>
      <Field label="封面圖片">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          className="input"
        />
      </Field>
      <Field label="摘要（顯示在列表與選單）">
        <textarea name="excerpt" rows={2} className="input" />
      </Field>
      <Field label="內文">
        <textarea name="content" rows={10} className="input" />
      </Field>
      <Field label="發布狀態">
        <select name="status" className="input" defaultValue="draft">
          <option value="draft">草稿</option>
          <option value="published">發布</option>
        </select>
      </Field>

      <div className="border-t border-line pt-6">
        <p className="mb-4 font-mono text-xs text-muted">SEO 設定（選填）</p>
        <Field label="SEO 標題">
          <input name="seo_title" className="input" />
        </Field>
        <Field label="SEO 描述">
          <textarea name="seo_description" rows={2} className="input" />
        </Field>
      </div>

      {error && <p className="text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-walnut px-6 py-3 tracking-wide2 text-surface hover:bg-brass disabled:opacity-50"
      >
        {saving ? "儲存中…" : "儲存文章"}
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #dad4c8;
          background: #f8f6f2;
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

function slugify(text: string) {
  const cleaned = text
    .toLowerCase()
    .trim()
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || `post-${Date.now()}`;
}
