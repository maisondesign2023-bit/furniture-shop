"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "@/types";

export default function ShippingInfoEditor({ order }: { order: Order }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [carrier, setCarrier] = useState(order.shipping_carrier ?? "");
  const [number, setNumber] = useState(order.tracking_number ?? "");
  const [url, setUrl] = useState(order.tracking_url ?? "");
  const [saving, setSaving] = useState(false);

  const hasTracking = order.shipping_carrier || order.tracking_number || order.tracking_url;

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/orders/update-shipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.id,
        shippingCarrier: carrier,
        trackingNumber: number,
        trackingUrl: url,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      alert("儲存失敗，請重新整理再試一次");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <div className="flex items-center gap-2 font-mono text-xs">
        {hasTracking ? (
          <>
            <span className="text-muted">
              {order.shipping_carrier} {order.tracking_number}
            </span>
            {order.tracking_url && (
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brass hover:underline"
              >
                查詢物流 →
              </a>
            )}
            <button type="button" onClick={() => setOpen(true)} className="text-muted hover:text-brass">
              編輯
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setOpen(true)} className="text-brass hover:underline">
            + 填寫物流資訊
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded border border-line bg-surface p-3 font-mono text-xs">
      <input
        value={carrier}
        onChange={(e) => setCarrier(e.target.value)}
        placeholder="物流公司（例如：黑貓宅急便）"
        className="border border-line bg-paper px-2 py-1"
      />
      <input
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="物流單號"
        className="border border-line bg-paper px-2 py-1"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="查詢連結（選填，例如物流公司的查詢頁網址）"
        className="border border-line bg-paper px-2 py-1"
      />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-walnut px-3 py-1.5 text-surface hover:bg-brass disabled:opacity-50"
        >
          {saving ? "儲存中…" : "儲存"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-brass">
          取消
        </button>
      </div>
    </div>
  );
}
