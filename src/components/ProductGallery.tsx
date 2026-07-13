"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "@/types";

export default function ProductGallery({
  images,
  productName,
  mainAspectClassName = "aspect-square",
}: {
  images: GalleryImage[];
  productName: string;
  mainAspectClassName?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className={`${mainAspectClassName} w-full bg-surface flex items-center justify-center text-muted`}>
        尚未上傳圖片
      </div>
    );
  }

  const active = images[activeIndex];

  function goTo(delta: number) {
    setActiveIndex((prev) => (prev + delta + images.length) % images.length);
  }

  return (
    <div>
      {/* 主圖，點擊放大 */}
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className={`relative block ${mainAspectClassName} w-full overflow-hidden bg-surface cursor-zoom-in`}
        aria-label="點擊放大圖片"
      >
        <Image
          src={active.url}
          alt={active.alt || productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
        />
      </button>

      {/* 縮圖列，最多 10 張 */}
      <div className="mt-3 grid grid-cols-5 gap-2">
        {images.slice(0, 10).map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            onMouseEnter={() => setActiveIndex(i)}
            className={`relative aspect-square overflow-hidden border bg-surface ${
              i === activeIndex ? "border-brass" : "border-line"
            }`}
            aria-label={`檢視第 ${i + 1} 張圖片`}
          >
            <Image
              src={img.url}
              alt={img.alt || `${productName} 圖片 ${i + 1}`}
              fill
              sizes="10vw"
              className="object-contain"
            />
          </button>
        ))}
      </div>

      {/* 燈箱 */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            className="absolute right-6 top-6 font-mono text-sm text-surface hover:text-brass"
            aria-label="關閉"
          >
            關閉 ✕
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goTo(-1);
            }}
            className="absolute left-4 font-display text-3xl text-surface hover:text-brass"
            aria-label="上一張"
          >
            ‹
          </button>

          <div
            className="relative h-[80vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active.url}
              alt={active.alt || productName}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goTo(1);
            }}
            className="absolute right-4 font-display text-3xl text-surface hover:text-brass"
            aria-label="下一張"
          >
            ›
          </button>

          <p className="absolute bottom-6 font-mono text-xs text-surface">
            {activeIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </div>
  );
}
