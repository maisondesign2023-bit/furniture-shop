"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "@/types";

export default function AdminOrderNoteEditor({ order }: { order: Order }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(order.admin_note ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/orders/update-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, adminNote: note }),
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
      <div className="flex items-start gap-2 font-mono text-xs">
        {order.admin_note ? (
          <>
            <span className="whitespace-pre-line text-muted">{order.admin_note}</span>
            <button type="button" onClick={() => setOpen(true)} className="shrink-0 text-muted hover:text-brass">
              編輯
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setOpen(true)} className="text-brass hover:underline">
            + 填寫備註
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded border border-line bg-surface p-3 font-mono text-xs">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="給客人看的備註，例如：已致電確認尺寸、缺貨延後出貨等"
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
