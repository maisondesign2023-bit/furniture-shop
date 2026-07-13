"use client";

import { useState } from "react";
import Link from "next/link";
import type { Category, BlogPost } from "@/types";

export default function MobileNav({
  categories,
  posts,
}: {
  categories: Category[];
  posts: BlogPost[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "關閉選單" : "開啟選單"}
        aria-expanded={open}
        className="flex flex-col justify-center gap-1.5 p-2"
      >
        <span className={`block h-0.5 w-6 bg-ink transition ${open ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`block h-0.5 w-6 bg-ink transition ${open ? "opacity-0" : ""}`} />
        <span className={`block h-0.5 w-6 bg-ink transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full max-h-[calc(100vh-72px)] overflow-y-auto border-b border-line bg-surface shadow-sm">
          <nav className="flex flex-col divide-y divide-line font-body text-sm">
            <div className="px-6 py-4">
              <p className="mb-2 font-mono text-xs text-muted">商品分類</p>
              <div className="flex flex-col gap-3">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="hover:text-brass"
                  >
                    {c.name}
                  </Link>
                ))}
                {categories.length === 0 && <p className="font-mono text-xs text-muted">尚未建立分類</p>}
              </div>
            </div>

            <Link href="/activities" onClick={() => setOpen(false)} className="px-6 py-4 hover:text-brass">
              最新活動
            </Link>

            <div className="px-6 py-4">
              <p className="mb-2 font-mono text-xs text-muted">探索更多</p>
              <div className="flex flex-col gap-3">
                {posts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/blog/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="hover:text-brass"
                  >
                    {p.title}
                  </Link>
                ))}
                <Link
                  href="/blog"
                  onClick={() => setOpen(false)}
                  className="font-mono text-xs text-brass"
                >
                  查看全部文章 →
                </Link>
              </div>
            </div>

            <Link href="/about" onClick={() => setOpen(false)} className="px-6 py-4 hover:text-brass">
              關於我們
            </Link>

            <div className="px-6 py-4">
              <Link href="/services" onClick={() => setOpen(false)} className="hover:text-brass">
                家配師服務
              </Link>
              <div className="mt-3 flex flex-col gap-3 pl-4">
                <Link
                  href="/services/residential"
                  onClick={() => setOpen(false)}
                  className="text-xs hover:text-brass"
                >
                  住家空間
                </Link>
                <Link
                  href="/services/commercial"
                  onClick={() => setOpen(false)}
                  className="text-xs hover:text-brass"
                >
                  商業空間
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
