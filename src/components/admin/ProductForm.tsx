"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import RichTextEditor, { type RichTextEditorHandle } from "@/components/admin/RichTextEditor";
import type { Category } from "@/types";

export default function ProductForm({ categories }: { categories: Category[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).slice(0, 10);
    setFiles(selected);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const slug = (form.get("slug") as string) || slugify(name);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 1. 新增商品
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          name,
          slug,
          category_id: form.get("category_id") || null,
          price: Number(form.get("price")),
          compare_at_price: form.get("compare_at_price")
            ? Number(form.get("compare_at_price"))
            : null,
          stock: Number(form.get("stock") || 0),
          description: editorRef.current?.getHTML() ?? "",
          status: form.get("status"),
          sizes: parseOptions(form.get("sizes") as string),
          colors: parseOptions(form.get("colors") as string),
          seo_title: form.get("seo_title") || null,
          seo_description: form.get("seo_description") || null,
          created_by: user?.id ?? null,
        })
        .select()
        .single();

      if (productError || !product) throw new Error(productError?.message);

      // 2. 上傳圖片（最多10張）到 Supabase Storage，再寫入 product_images
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `${product.id}/${Date.now()}-${i}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file);
        if (uploadError) throw new Error(uploadError.message);

        const { data: publicUrl } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);

        await supabase.from("product_images").insert({
          product_id: product.id,
          url: publicUrl.publicUrl,
          alt: name,
          sort_order: i,
        });
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 font-body text-sm">
      <Field label="商品名稱">
        <input name="name" required className="input" />
      </Field>
      <Field label="網址代稱 slug（留空自動產生，如 oak-sofa）">
        <input name="slug" className="input" />
      </Field>
      <Field label="分類">
        <select name="category_id" className="input">
          <option value="">未分類</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="價格 (NT$)">
          <input name="price" type="number" step="1" required className="input" />
        </Field>
        <Field label="劃線原價（選填）">
          <input name="compare_at_price" type="number" step="1" className="input" />
        </Field>
      </div>
      <Field label="庫存數量">
        <input name="stock" type="number" defaultValue={0} className="input" />
      </Field>
      <Field label="尺寸選項（用逗號分開，例如：S,M,L；不需要就留空）">
        <input name="sizes" className="input" placeholder="S,M,L" />
      </Field>
      <Field label="顏色選項（用逗號分開，例如：白色,黑色,原木色；不需要就留空）">
        <input name="colors" className="input" placeholder="白色,黑色,原木色" />
      </Field>
      <Field label="上架狀態">
        <select name="status" className="input" defaultValue="draft">
          <option value="draft">草稿</option>
          <option value="published">已上架</option>
          <option value="archived">已下架</option>
        </select>
      </Field>
      <Field label="商品敘述">
        <RichTextEditor ref={editorRef} name="description" bucket="product-images" />
      </Field>

      <Field label={`商品圖片（最多10張，第一張為主圖），已選 ${files.length} 張`}>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="input"
        />
      </Field>

      <div className="border-t border-line pt-6">
        <p className="font-mono text-xs text-muted mb-4">SEO 設定（選填，留空會用商品名稱）</p>
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
        {saving ? "儲存中…" : "儲存商品"}
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
  return cleaned || `product-${Date.now()}`;
}

function parseOptions(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
