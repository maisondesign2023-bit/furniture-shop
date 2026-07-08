"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sanitizeFileName } from "@/lib/sanitize-filename";

export default function BannerForm() {
  const supabase = createClient();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setError("請選擇一張圖片");
      return;
    }
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      const path = `${Date.now()}-${sanitizeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from("banner-images")
        .upload(path, file);
      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrl } = supabase.storage
        .from("banner-images")
        .getPublicUrl(path);

      const { error: insertError } = await supabase.from("banners").insert({
        image_url: publicUrl.publicUrl,
        type: form.get("type") || "hero",
        title: form.get("title") || null,
        subtitle: form.get("subtitle") || null,
        link_url: form.get("link_url") || null,
        sort_order: Number(form.get("sort_order") || 0),
        is_active: true,
      });
      if (insertError) throw new Error(insertError.message);

      router.refresh();
      (e.target as HTMLFormElement).reset();
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-5 border border-line p-6 font-body text-sm"
    >
      <p className="font-mono text-xs text-muted">新增一張首頁圖片</p>
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-muted">圖片類型</span>
        <select name="type" className="input" defaultValue="hero">
          <option value="hero">最新消息（首頁最上方主圖，含標題文字）</option>
          <option value="divider">分隔圖片（純圖片，區隔商品區塊用）</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-muted">圖片</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="input"
        />
      </label>
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-muted">主標題（分隔圖片可留空）</span>
        <input name="title" className="input" placeholder="為每個空間，找到合適的重量。" />
      </label>
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-muted">副標文字（分隔圖片可留空）</span>
        <textarea name="subtitle" rows={2} className="input" />
      </label>
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-muted">
          點擊後導向的網址（選填，如 /category/living-room）
        </span>
        <input name="link_url" className="input" />
      </label>
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-muted">排序（數字越小越優先顯示）</span>
        <input name="sort_order" type="number" defaultValue={0} className="input" />
      </label>

      {error && <p className="text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-walnut px-6 py-3 tracking-wide2 text-surface hover:bg-brass disabled:opacity-50"
      >
        {saving ? "上傳中…" : "新增圖片"}
      </button>

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
