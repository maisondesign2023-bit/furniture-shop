"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sanitizeFileName } from "@/lib/sanitize-filename";
import SortableImageGrid, { type SortableImage } from "@/components/admin/SortableImageGrid";
import type { ServicePageImage, ServicePageSection } from "@/types";

const SECTION_LABELS: Record<ServicePageSection, string> = {
  hero: "首頁大圖（Hero，建議 2 張）",
  furniture_design: "傢俱設計",
  space_planning: "規劃配置",
  decor_styling: "軟裝搭配",
};

const SECTIONS = Object.keys(SECTION_LABELS) as ServicePageSection[];

export default function ServicePageImageManager({
  initialImages,
}: {
  initialImages: ServicePageImage[];
}) {
  return (
    <div className="space-y-12">
      {SECTIONS.map((section) => (
        <SectionEditor
          key={section}
          section={section}
          label={SECTION_LABELS[section]}
          initialImages={initialImages
            .filter((img) => img.section === section)
            .sort((a, b) => a.sort_order - b.sort_order)}
        />
      ))}
    </div>
  );
}

function SectionEditor({
  section,
  label,
  initialImages,
}: {
  section: ServicePageSection;
  label: string;
  initialImages: ServicePageImage[];
}) {
  const supabase = createClient();
  const [images, setImages] = useState<SortableImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      let nextSortOrder = images.length;
      const uploaded: SortableImage[] = [];
      for (const file of files) {
        const path = `service-page/${section}/${Date.now()}-${sanitizeFileName(file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("case-images")
          .upload(path, file);
        if (uploadError) throw new Error(uploadError.message);

        const { data: publicUrl } = supabase.storage.from("case-images").getPublicUrl(path);

        const { data: inserted, error: insertError } = await supabase
          .from("service_page_images")
          .insert({ section, url: publicUrl.publicUrl, alt: label, sort_order: nextSortOrder })
          .select()
          .single();
        if (insertError || !inserted) throw new Error(insertError?.message);

        uploaded.push(inserted as SortableImage);
        nextSortOrder += 1;
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上傳失敗");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleRemove(id: string) {
    await supabase.from("service_page_images").delete().eq("id", id);
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  async function handleReorder(reordered: SortableImage[]) {
    setImages(reordered);
    for (let i = 0; i < reordered.length; i++) {
      const { error } = await supabase
        .from("service_page_images")
        .update({ sort_order: i })
        .eq("id", reordered[i].id);
      if (error) {
        alert(`圖片排序更新失敗：${error.message}\n請重新整理頁面再試一次。`);
        return;
      }
    }
  }

  return (
    <div className="border-t border-line pt-8 first:border-t-0 first:pt-0">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-walnut">{label}</h3>
        <label className="cursor-pointer font-mono text-xs text-brass hover:underline">
          {uploading ? "上傳中…" : "+ 上傳圖片"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
            disabled={uploading}
          />
        </label>
      </div>
      {error && <p className="mb-3 font-body text-xs text-red-700">{error}</p>}
      {images.length === 0 ? (
        <p className="font-body text-xs text-muted">尚未上傳圖片</p>
      ) : (
        <SortableImageGrid images={images} onReorder={handleReorder} onRemove={handleRemove} />
      )}
    </div>
  );
}
