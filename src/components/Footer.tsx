import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grain-divider mb-10" />
        <div className="grid gap-10 font-body text-sm text-muted md:grid-cols-3">
          <div>
            <p className="font-display text-lg font-semibold text-walnut">VERO Living</p>
            <p className="mt-2 leading-relaxed">
              職人工藝、質感簡約的家具選物。
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/policy/shipping" className="hover:text-brass">運送與退換貨</Link>
            <Link href="/policy/privacy" className="hover:text-brass">隱私權政策</Link>
            <Link href="/about" className="hover:text-brass">關於我們</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span>客服信箱：service@example.com</span>
            <span>週一至週五 10:00–18:00</span>
          </div>
        </div>
        <p className="mt-10 font-mono text-xs text-muted">
          © {new Date().getFullYear()} VERO Living All rights reserved.
        </p>
      </div>
    </footer>
  );
}
