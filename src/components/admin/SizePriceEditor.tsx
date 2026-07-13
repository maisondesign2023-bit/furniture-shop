"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import type { SizePrice } from "@/types";

export type SizePriceEditorHandle = {
  getValue: () => SizePrice[];
};

const SizePriceEditor = forwardRef<SizePriceEditorHandle, { initialValue?: SizePrice[] }>(
  function SizePriceEditor({ initialValue = [] }, ref) {
    const [rows, setRows] = useState<SizePrice[]>(initialValue);

    useImperativeHandle(
      ref,
      () => ({
        getValue: () => rows.filter((r) => r.label.trim().length > 0),
      }),
      [rows]
    );

    function addRow() {
      setRows((prev) => [...prev, { label: "", price: 0 }]);
    }

    function updateRow(index: number, patch: Partial<SizePrice>) {
      setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    }

    function removeRow(index: number) {
      setRows((prev) => prev.filter((_, i) => i !== index));
    }

    return (
      <div>
        <span className="mb-2 block font-mono text-xs text-muted">
          尺寸與對應價格（不需要就留空，會直接用上方「價格」欄位）
        </span>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={row.label}
                onChange={(e) => updateRow(i, { label: e.target.value })}
                placeholder="尺寸，例如 S"
                className="row-input flex-1"
              />
              <input
                type="number"
                step="1"
                value={row.price}
                onChange={(e) => updateRow(i, { price: Number(e.target.value) })}
                placeholder="價格"
                className="row-input w-32"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="font-mono text-xs text-red-700 hover:underline"
              >
                移除
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addRow}
          className="mt-2 font-mono text-xs text-brass hover:underline"
        >
          + 新增尺寸
        </button>

        <style jsx>{`
          .row-input {
            border: 1px solid #e2ded8;
            background: #f7f6f4;
            padding: 0.5rem 0.75rem;
          }
          .row-input:focus {
            border-color: #9c7a4f;
            outline: none;
          }
        `}</style>
      </div>
    );
  }
);

export default SizePriceEditor;
