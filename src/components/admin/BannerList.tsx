"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sanitizeFileName } from "@/lib/sanitize-filename";
import type { Banner } from "@/types";

export default function BannerList({ banners }: { banners: Banner[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  async function toggleActive(id: string, current: boolean) {
    await supabase.from("banners").update({ is_active: !current }).eq("id", id);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("確定要刪除這張圖片嗎？")) return;
    await supabase.from("banners").delete().eq("id", id);
    router.refresh();
  }

  if (banners.length === 0) {
    return <p className="mt-4 font-body text-sm text-muted">尚未新增任何圖片。</p>;
  }

  return (
    <div className="mt-4 space-y-4">
      {banners.map((b) =>
        editingId === b.id ? (
          <BannerEditRow key={b.id} banner={b} onDone={() => setEditingId(null)} />
        ) : (
          <div key={b.id} className="flex items-center gap-4 border border-line p-4">
            <div className="relative h-20 w-28 shrink-0 overflow-hidden bg-surface">
              <Image src={b.image_url} alt={b.title || ""} fill className="object-cover" />
            </div>
            <div className="flex-1 font-body text-sm">
              <p>{b.title || "（無標題）"}</p>
              <p className="font-mono text-xs text-muted">
                {b.type === "hero" ? "最新消息" : "分隔圖片"} · 排序 {b.sort_order} ·{" "}
                {b.is_active ? "啟用中" : "已停用"}
              </p>
            </div>
            <button
              onClick={() => setEditingId(b.id)}
              className="font-mono text-xs text-brass hover:underline"
            >
              編輯
            </button>
            <button
              onClick={() => toggleActive(b.id, b.is_active)}
              className="font-mono text-xs text-brass hover:underline"
            >
              {b.is_active ? "停用" : "啟用"}
            </button>
            <button
              onClick={() => remove(b.id)}
              className="font-mono text-xs text-red-700 hover:underline"
            >
              刪除
            </button>
          </div>
        )
      )}
    </div>
  );
}

function BannerEditRow({ banner, onDone }: { banner: Banner; onDone: () => void }) {
  const supabase = createClient();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    try {
      let imageUrl = banner.image_url;
      if (file) {
        const path = `${Date.now()}-${sanitizeFileName(file.name)}`;
        const { error: uploadError } = await supabase.storage.from("banner-images").upload(path, file);
        if (uploadError) throw new Error(uploadError.message);
        const { data: publicUrl } = supabase.storage.from("banner-images").getPublicUrl(path);
        imageUrl = publicUrl.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("banners")
        .update({
          image_url: imageUrl,
          title: form.get("title") || null,
          subtitle: form.get("subtitle") || null,
          link_url: form.get("link_url") || null,
          sort_order: Number(form.get("sort_order") || 0),
        })
        .eq("id", banner.id);
      if (updateError) throw new Error(updateError.message);

      router.refresh();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border border-brass bg-surface p-4 font-body text-sm"
    >
      <p className="font-mono text-xs text-muted">
        編輯{banner.type === "hero" ? "最新消息" : "分隔圖片"}
      </p>

      <div className="flex items-center gap-4">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden border border-line bg-paper">
          <Image src={banner.image_url} alt={banner.title || ""} fill className="object-cover" />
        </div>
        <label className="flex-1">
          <span className="mb-1 block font-mono text-xs text-muted">更換圖片（選填，留空維持原圖）</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="input"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block font-mono text-xs text-muted">主標題（分隔圖片可留空）</span>
        <input name="title" defaultValue={banner.title ?? ""} className="input" />
      </label>
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-muted">副標文字（分隔圖片可留空）</span>
        <textarea name="subtitle" defaultValue={banner.subtitle ?? ""} rows={2} className="input" />
      </label>
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-muted">
          點擊後導向的網址（選填，如 /category/living-room）
        </span>
        <input name="link_url" defaultValue={banner.link_url ?? ""} className="input" />
      </label>
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-muted">排序（數字越小越優先顯示）</span>
        <input name="sort_order" type="number" defaultValue={banner.sort_order} className="input" />
      </label>

      {error && <p className="text-red-700">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-walnut px-6 py-2.5 tracking-wide2 text-surface hover:bg-brass disabled:opacity-50"
        >
          {saving ? "儲存中…" : "儲存變更"}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={saving}
          className="font-mono text-xs text-muted hover:underline disabled:opacity-50"
        >
          取消
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #E2DED8;
          background: #FFFFFF;
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
