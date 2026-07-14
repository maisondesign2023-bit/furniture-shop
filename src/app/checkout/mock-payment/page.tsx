"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function MockPaymentContent() {
  const params = useSearchParams();
  const router = useRouter();
  const orderNo = params.get("orderNo");
  const amount = params.get("amount");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/mock-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNo }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "模擬付款失敗，請稍後再試");
      }
      router.push("/checkout/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="font-mono text-xs text-brass">開發測試用付款頁</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-walnut">
        模擬付款
      </h1>
      <p className="mt-4 font-body text-sm text-muted">
        訂單編號 {orderNo}，金額 NT$ {amount}
      </p>
      <p className="mt-2 font-body text-xs text-muted">
        正式上線前請將此頁替換為綠界／藍新的真實付款流程。
      </p>

      {error && <p className="mt-4 font-body text-sm text-red-700">{error}</p>}

      <button
        type="button"
        onClick={handleComplete}
        disabled={submitting}
        className="mt-8 bg-walnut px-6 py-3 font-body text-sm tracking-wide2 text-surface hover:bg-brass disabled:opacity-50"
      >
        {submitting ? "處理中…" : "模擬付款完成"}
      </button>
    </div>
  );
}

export default function MockPaymentPage() {
  return (
    <Suspense fallback={null}>
      <MockPaymentContent />
    </Suspense>
  );
}
