"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

export default function CheckoutForm() {
  const { items, subtotal, clear } = useCart();
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
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "建立訂單失敗，請稍後再試");
      }
      const { actionUrl, formFields } = await res.json();

      clear();

      // 金流商（綠界）要求用表單 POST 導向付款頁面，不能用網址帶參數的方式
      const paymentForm = document.createElement("form");
      paymentForm.method = "POST";
      paymentForm.action = actionUrl;
      Object.entries(formFields as Record<string, string>).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        paymentForm.appendChild(input);
      });
      document.body.appendChild(paymentForm);
      paymentForm.submit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
      setSubmitting(false);
    }
  }

  return (
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
  );
}
