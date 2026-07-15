"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import RichTextEditor, { type RichTextEditorHandle } from "@/components/admin/RichTextEditor";
import SortableImageGrid, { type SortableImage } from "@/components/admin/SortableImageGrid";
import type { CaseStudy } from "@/types";
import { sanitizeFileName } from "@/lib/sanitize-filename";
import { slugify } from "@/lib/slugify";

export default function CaseStudyEditForm({ caseStudy }: { caseStudy: CaseStudy }) {
  const supabase = createClient();
  const router = useRouter();
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [existingImages, setExistingImages] = useState<SortableImage[]>(
    (caseStudy.case_study_images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const remainingSlots = Math.max(0, 10 - existingImages.length);
    setNewFiles(Array.from(e.target.files ?? []).slice(0, remainingSlots));
  }

  async function removeExistingImage(imageId: string) {
    await supabase.from("case_study_images").delete().eq("id", imageId);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  async function reorderExistingImages(reordered: SortableImage[]) {
    setExistingImages(reordered);
    for (let i = 0; i < reordered.length; i++) {
      const { error } = await supabase
        .from("case_study_images")
        .update({ sort_order: i })
        .eq("id", reordered[i].id);
      if (error) {
        alert(`圖片排序更新失敗：${error.message}\n請重新整理頁面再試一次。`);
        return;
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      const { error: updateError } = await supabase
        .from("case_studies")
        .update({
          title: form.get("title"),
          slug: slugify((form.get("slug") as string) || (form.get("title") as string), "case"),
          summary: form.get("summary"),
          content: editorRef.current?.getHTML() ?? "",
          status: form.get("status"),
          space_type: form.get("space_type"),
          sort_order: Number(form.get("sort_order") || 0),
        })
        .eq("id", caseStudy.id);

      if (updateError) throw new Error(updateError.message);

      // 上傳新增的圖片，接續在現有圖片後面
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const path = `${caseStudy.id}/${Date.now()}-${i}-${sanitizeFileName(file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("case-images")
          .upload(path, file);
        if (uploadError) throw new Error(uploadError.message);

        const { data: publicUrl } = supabase.storage
          .from("case-images")
          .getPublicUrl(path);

        await supabase.from("case_study_images").insert({
          case_study_id: caseStudy.id,
          url: publicUrl.publicUrl,
          alt: form.get("title"),
          sort_order: existingImages.length + i,
        });
      }

      router.push("/admin/cases");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCase() {
    if (!confirm(`確定要刪除「${caseStudy.title}」這個案例嗎？此動作無法復原。`)) return;
    setDeleting(true);
    await supabase.from("case_studies").delete().eq("id", caseStudy.id);
    router.push("/admin/cases");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 font-body text-sm">
      <Field label="案例名稱">
        <input name="title" defaultValue={caseStudy.title} required className="input" />
      </Field>
      <Field label="網址代稱 slug">
        <input name="slug" defaultValue={caseStudy.slug} required className="input" />
      </Field>
      <Field label="摘要（顯示在下拉選單與列表）">
        <textarea name="summary" defaultValue={caseStudy.summary ?? ""} rows={2} className="input" />
      </Field>
      <Field label="完整說明">
        <RichTextEditor
          ref={editorRef}
          name="content"
          bucket="case-images"
          initialValue={caseStudy.content ?? ""}
        />
      </Field>

      <div>
        <span className="mb-2 block font-mono text-xs text-muted">
          目前的圖片（{existingImages.length} 張，第一張為主圖，拖曳可調整順序）
        </span>
        <SortableImageGrid
          images={existingImages}
          onReorder={reorderExistingImages}
          onRemove={removeExistingImage}
        />
      </div>

      <Field label={`新增圖片（最多可再加 ${Math.max(0, 10 - existingImages.length)} 張，已選 ${newFiles.length} 張）`}>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="空間類型">
          <select name="space_type" defaultValue={caseStudy.space_type} className="input">
            <option value="residential">住家空間</option>
            <option value="commercial">商業空間</option>
          </select>
        </Field>
        <Field label="發布狀態">
          <select name="status" defaultValue={caseStudy.status} className="input">
            <option value="draft">草稿</option>
            <option value="published">發布</option>
          </select>
        </Field>
      </div>
      <Field label="排序（數字越小越前面）">
        <input name="sort_order" type="number" defaultValue={caseStudy.sort_order} className="input" />
      </Field>

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
          onClick={handleDeleteCase}
          disabled={deleting}
          className="font-mono text-xs text-red-700 hover:underline disabled:opacity-50"
        >
          刪除這個案例
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
