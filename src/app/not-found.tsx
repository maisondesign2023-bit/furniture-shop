export const runtime = "edge";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold">找不到這個頁面</h1>
      <p className="mt-3 text-neutral-600">
        您要找的頁面不存在，或已經被移除。
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-black px-6 py-2 text-white transition hover:bg-neutral-800"
      >
        回到首頁
      </Link>
    </div>
  );
}
