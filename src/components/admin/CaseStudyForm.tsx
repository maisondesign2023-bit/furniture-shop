"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import RichTextEditor, { type RichTextEditorHandle } from "@/components/admin/RichTextEditor";
import { sanitizeFileName } from "@/lib/sanitize-filename";

export default function CaseStudyForm() {
  const supabase = createClient();
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(e.target.files ?? []).slice(0, 10));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const slug = (form.get("slug") as string) || slugify(title);

    try {
      const { data: caseStudy, error: caseError } = await supabase
        .from("case_studies")
        .insert({
          title,
          slug,
          summary: form.get("summary"),
          content: editorRef.current?.getHTML() ?? "",
          status: form.get("status"),
          sort_order: Number(form.get("sort_order") || 0),
        })
        .select()
        .single();

      if (caseError || !caseStudy) throw new Error(caseError?.message);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
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
          alt: title,
          sort_order: i,
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

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 font-body text-sm">
      <Field label="案例名稱">
        <input name="title" required className="input" />
      </Field>
      <Field label="網址代稱 slug（留空自動產生，建議手動填英文）">
        <input name="slug" className="input" />
      </Field>
      <Field label="摘要（顯示在下拉選單與列表）">
        <textarea name="summary" rows={2} className="input" />
      </Field>
      <Field label="完整說明">
        <RichTextEditor ref={editorRef} name="content" bucket="case-images" />
      </Field>
      <Field label={`案例圖片（最多10張，已選 ${files.length} 張）`}>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="input"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="發布狀態">
          <select name="status" className="input" defaultValue="draft">
            <option value="draft">草稿</option>
            <option value="published">發布</option>
          </select>
        </Field>
        <Field label="排序（數字越小越前面）">
          <input name="sort_order" type="number" defaultValue={0} className="input" />
        </Field>
      </div>

      {error && <p className="text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-walnut px-6 py-3 tracking-wide2 text-surface hover:bg-brass disabled:opacity-50"
      >
        {saving ? "儲存中…" : "儲存案例"}
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
  return cleaned || `case-${Date.now()}`;
}
