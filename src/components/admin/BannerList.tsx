"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Banner } from "@/types";

export default function BannerList({ banners }: { banners: Banner[] }) {
  const supabase = createClient();
  const router = useRouter();

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
      {banners.map((b) => (
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
      ))}
    </div>
  );
}
