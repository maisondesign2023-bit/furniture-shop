"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

export default function AddToCartButton({
  productId,
  name,
  slug,
  price,
  image,
  sizes = [],
  colors = [],
}: {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  sizes?: string[];
  colors?: string[];
}) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(colors[0] || "");

  return (
    <div className="space-y-4">
      {sizes.length > 0 && (
        <label className="block">
          <span className="mb-1 block font-mono text-xs text-muted">尺寸</span>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full border border-line bg-surface px-4 py-3 font-body text-sm focus:border-brass"
          >
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      )}

      {colors.length > 0 && (
        <label className="block">
          <span className="mb-1 block font-mono text-xs text-muted">顏色</span>
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-full border border-line bg-surface px-4 py-3 font-body text-sm focus:border-brass"
          >
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-line">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-2 font-mono text-sm hover:text-brass"
            aria-label="減少數量"
          >
            −
          </button>
          <span className="w-8 text-center font-mono text-sm">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="px-3 py-2 font-mono text-sm hover:text-brass"
            aria-label="增加數量"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            addItem({
              productId,
              name,
              slug,
              price,
              image,
              quantity: qty,
              selectedSize: selectedSize || null,
              selectedColor: selectedColor || null,
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
          className="flex-1 bg-walnut px-6 py-3 font-body text-sm tracking-wide2 text-surface transition hover:bg-brass"
        >
          {added ? "已加入購物車" : "加入購物車"}
        </button>
      </div>
    </div>
  );
}
