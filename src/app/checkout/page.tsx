"use client";

export const runtime = "edge";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      recipientName: form.get("recipientName"),
      recipientPhone: form.get("recipientPhone"),
      shippingAddress: form.get("shippingAddress"),
      items,
      subtotal,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("建立訂單失敗，請稍後再試");
      const { actionUrl, formFields } = await res.json();

      clear();
      // 之後接上真實金流商後，這裡會改成 auto-submit 表單導向金流頁面。
      // 目前先導向 mock 付款頁，方便先跑通流程。
      const params = new URLSearchParams(formFields).toString();
      router.push(`${actionUrl}?${params}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-display text-3xl italic text-walnut">結帳</h1>
      <div className="grain-divider my-8" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="font-mono text-xs text-muted">收件人姓名</label>
          <input
            name="recipientName"
            required
            className="mt-1 w-full border border-line bg-surface px-4 py-3 font-body text-sm focus:border-brass"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-muted">聯絡電話</label>
          <input
            name="recipientPhone"
            required
            className="mt-1 w-full border border-line bg-surface px-4 py-3 font-body text-sm focus:border-brass"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-muted">收件地址</label>
          <textarea
            name="shippingAddress"
            required
            rows={3}
            className="mt-1 w-full border border-line bg-surface px-4 py-3 font-body text-sm focus:border-brass"
          />
        </div>

        <div className="flex items-center justify-between border-t border-line pt-6">
          <span className="font-body text-muted">應付金額</span>
          <span className="font-mono text-xl text-walnut">
            NT$ {subtotal.toLocaleString()}
          </span>
        </div>

        {error && <p className="font-body text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting || items.length === 0}
          className="w-full bg-walnut px-6 py-4 font-body text-sm tracking-wide2 text-surface hover:bg-brass disabled:opacity-50"
        >
          {submitting ? "處理中…" : "前往付款"}
        </button>
      </form>
    </div>
  );
}
