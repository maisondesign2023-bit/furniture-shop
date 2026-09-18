"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import RichTextEditor, { type RichTextEditorHandle } from "@/components/admin/RichTextEditor";
import { sanitizeFileName } from "@/lib/sanitize-filename";
import { slugify } from "@/lib/slugify";
import type { BlogPost } from "@/types";

export default function BlogPostEditForm({ post }: { post: BlogPost }) {
  const supabase = createClient();
  const router = useRouter();
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState(post.cover_image);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const status = form.get("status") as string;

    try {
      let coverUrl = existingCoverUrl;
      if (coverFile) {
        const path = `${Date.now()}-${sanitizeFileName(coverFile.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("blog-images")
          .upload(path, coverFile);
        if (uploadError) throw new Error(uploadError.message);
        const { data: publicUrl } = supabase.storage.from("blog-images").getPublicUrl(path);
        coverUrl = publicUrl.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("blog_posts")
        .update({
          title,
          slug: slugify((form.get("slug") as string) || title, "post"),
          cover_image: coverUrl,
          excerpt: form.get("excerpt"),
          content: editorRef.current?.getHTML() ?? "",
          status,
          seo_title: form.get("seo_title") || null,
          seo_description: form.get("seo_description") || null,
          published_at:
            status === "published" ? post.published_at ?? new Date().toISOString() : post.published_at,
        })
        .eq("id", post.id);
      if (updateError) throw new Error(updateError.message);

      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`確定要刪除「${post.title}」這篇文章嗎？此動作無法復原。`)) return;
    setDeleting(true);
    const { error: deleteError } = await supabase.from("blog_posts").delete().eq("id", post.id);
    setDeleting(false);
    if (deleteError) {
      alert(`刪除失敗：${deleteError.message}`);
      return;
    }
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 font-body text-sm">
      <Field label="文章標題">
        <input name="title" defaultValue={post.title} required className="input" />
      </Field>
      <Field label="網址代稱 slug（英文/數字，會自動轉換格式）">
        <input name="slug" defaultValue={post.slug} className="input" />
      </Field>

      <div>
        <span className="mb-1 block font-mono text-xs text-muted">封面圖片</span>
        {existingCoverUrl && (
          <div className="mb-3 flex items-center gap-4">
            <div className="relative h-24 w-32 overflow-hidden border border-line bg-surface">
              <Image src={existingCoverUrl} alt={post.title} fill sizes="128px" className="object-cover" />
            </div>
            <button
              type="button"
              onClick={() => setExistingCoverUrl(null)}
              className="font-mono text-xs text-red-700 hover:underline"
            >
              移除封面圖片
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          className="input"
        />
      </div>

      <Field label="摘要（顯示在列表與選單）">
        <textarea name="excerpt" defaultValue={post.excerpt ?? ""} rows={2} className="input" />
      </Field>
      <Field label="內文">
        <RichTextEditor ref={editorRef} name="content" bucket="blog-images" initialValue={post.content ?? ""} />
      </Field>
      <Field label="發布狀態（草稿不會出現在前台，整理好再切換成發布）">
        <select name="status" defaultValue={post.status} className="input">
          <option value="draft">草稿</option>
          <option value="published">發布</option>
        </select>
      </Field>

      <div className="border-t border-line pt-6">
        <p className="mb-4 font-mono text-xs text-muted">SEO 設定（選填）</p>
        <Field label="SEO 標題">
          <input name="seo_title" defaultValue={post.seo_title ?? ""} className="input" />
        </Field>
        <Field label="SEO 描述">
          <textarea name="seo_description" defaultValue={post.seo_description ?? ""} rows={2} className="input" />
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

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="font-mono text-xs text-red-700 hover:underline disabled:opacity-50"
        >
          {deleting ? "刪除中…" : "刪除這篇文章"}
        </button>
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
