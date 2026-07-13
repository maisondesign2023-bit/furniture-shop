"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import RichTextEditor, { type RichTextEditorHandle } from "@/components/admin/RichTextEditor";
import SizePriceEditor, { type SizePriceEditorHandle } from "@/components/admin/SizePriceEditor";
import SortableImageGrid, { type SortableImage } from "@/components/admin/SortableImageGrid";
import type { Category, Product } from "@/types";
import { sanitizeFileName } from "@/lib/sanitize-filename";

export default function ProductEditForm({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const editorRef = useRef<RichTextEditorHandle>(null);
  const sizePriceRef = useRef<SizePriceEditorHandle>(null);
  const [existingImages, setExistingImages] = useState<SortableImage[]>(
    (product.product_images ?? [])
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
    await supabase.from("product_images").delete().eq("id", imageId);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  async function reorderExistingImages(reordered: SortableImage[]) {
    setExistingImages(reordered);
    await Promise.all(
      reordered.map((img, i) =>
        supabase.from("product_images").update({ sort_order: i }).eq("id", img.id)
      )
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: form.get("name"),
          category_id: form.get("category_id") || null,
          price: Number(form.get("price")),
          compare_at_price: form.get("compare_at_price")
            ? Number(form.get("compare_at_price"))
            : null,
          stock: Number(form.get("stock") || 0),
          description: editorRef.current?.getHTML() ?? "",
          status: form.get("status"),
          size_prices: sizePriceRef.current?.getValue() ?? [],
          colors: parseOptions(form.get("colors") as string),
          seo_title: form.get("seo_title") || null,
          seo_description: form.get("seo_description") || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      if (updateError) throw new Error(updateError.message);

      // 上傳新增的圖片，接續在現有圖片後面
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const path = `${product.id}/${Date.now()}-${i}-${sanitizeFileName(file.name)}`;
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
          alt: form.get("name"),
          sort_order: existingImages.length + i,
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

  async function handleDeleteProduct() {
    if (!confirm(`確定要刪除「${product.name}」這個商品嗎？此動作無法復原。`)) return;
    setDeleting(true);
    await supabase.from("products").delete().eq("id", product.id);
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 font-body text-sm">
      <Field label="商品名稱">
        <input name="name" defaultValue={product.name} required className="input" />
      </Field>
      <Field label="分類">
        <select name="category_id" defaultValue={product.category_id ?? ""} className="input">
          <option value="">未分類</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="價格 (NT$)">
          <input name="price" type="number" step="1" defaultValue={product.price} required className="input" />
        </Field>
        <Field label="劃線原價（選填）">
          <input
            name="compare_at_price"
            type="number"
            step="1"
            defaultValue={product.compare_at_price ?? ""}
            className="input"
          />
        </Field>
      </div>
      <Field label="庫存數量">
        <input name="stock" type="number" defaultValue={product.stock} className="input" />
      </Field>
      <SizePriceEditor ref={sizePriceRef} initialValue={product.size_prices ?? []} />
      <Field label="顏色選項（用逗號分開，例如：白色,黑色,原木色；不需要就留空）">
        <input name="colors" defaultValue={(product.colors ?? []).join(",")} className="input" />
      </Field>
      <Field label="上架狀態">
        <select name="status" defaultValue={product.status} className="input">
          <option value="draft">草稿</option>
          <option value="published">已上架</option>
          <option value="archived">已下架</option>
        </select>
      </Field>
      <Field label="商品敘述">
        <RichTextEditor ref={editorRef} name="description" bucket="product-images" initialValue={product.description ?? ""} />
      </Field>

      <div>
        <span className="mb-2 block font-mono text-xs text-muted">
          目前的圖片（{existingImages.length} 張，第一張為主圖，拖曳可調整順序）
        </span>
        <SortableImageGrid
          images={existingImages}
          onReorder={reorderExistingImages}
          onRemove={removeExistingImage}
          objectFit="contain"
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

      <div className="border-t border-line pt-6">
        <p className="mb-4 font-mono text-xs text-muted">SEO 設定（選填，留空會用商品名稱）</p>
        <Field label="SEO 標題">
          <input name="seo_title" defaultValue={product.seo_title ?? ""} className="input" />
        </Field>
        <Field label="SEO 描述">
          <textarea name="seo_description" defaultValue={product.seo_description ?? ""} rows={2} className="input" />
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
          onClick={handleDeleteProduct}
          disabled={deleting}
          className="font-mono text-xs text-red-700 hover:underline disabled:opacity-50"
        >
          刪除這個商品
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

function parseOptions(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
