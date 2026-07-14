"use client";

import { useState } from "react";

export default function PayNowButton({ orderId }: { orderId: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "無法建立付款流程，請稍後再試");
      }
      const { actionUrl, formFields } = await res.json();

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
    <div className="mt-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={submitting}
        className="bg-walnut px-5 py-2 font-body text-xs tracking-wide2 text-surface hover:bg-brass disabled:opacity-50"
      >
        {submitting ? "處理中…" : "立即付款"}
      </button>
      {error && <p className="mt-2 font-body text-xs text-red-700">{error}</p>}
    </div>
  );
}
