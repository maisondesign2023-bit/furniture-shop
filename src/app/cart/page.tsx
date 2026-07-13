"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart, getCartItemKey } from "@/lib/cart-context";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-walnut">購物車是空的</h1>
        <Link
          href="/"
          className="mt-6 inline-block border border-walnut px-6 py-3 font-body text-sm tracking-wide2 text-walnut hover:bg-walnut hover:text-surface"
        >
          繼續選購
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="font-display text-3xl font-semibold text-walnut">購物車</h1>
      <div className="grain-divider my-8" />

      <div className="space-y-6">
        {items.map((item) => {
          const key = getCartItemKey(item);
          return (
            <div key={key} className="flex gap-4 border-b border-line pb-6">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-surface">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill className="object-contain" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between">
                  <Link href={`/product/${item.slug}`} className="font-body text-sm hover:text-brass">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(key)}
                    className="font-mono text-xs text-muted hover:text-brass"
                  >
                    移除
                  </button>
                </div>
                {(item.selectedSize || item.selectedColor) && (
                  <p className="mt-1 font-mono text-xs text-muted">
                    {[item.selectedSize, item.selectedColor].filter(Boolean).join(" / ")}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-line">
                    <button
                      onClick={() => updateQuantity(key, item.quantity - 1)}
                      className="px-3 py-1 font-mono text-sm hover:text-brass"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-mono text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(key, item.quantity + 1)}
                      className="px-3 py-1 font-mono text-sm hover:text-brass"
                    >
                      +
                    </button>
                  </div>
                  <p className="price-tag">
                    NT$ {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <span className="font-body text-muted">小計</span>
        <span className="font-mono text-xl text-walnut">
          NT$ {subtotal.toLocaleString()}
        </span>
      </div>

      <Link
        href="/checkout"
        className="mt-8 block bg-walnut px-6 py-4 text-center font-body text-sm tracking-wide2 text-surface hover:bg-brass"
      >
        前往結帳
      </Link>
    </div>
  );
}
