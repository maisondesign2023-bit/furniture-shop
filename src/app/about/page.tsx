import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "關於我們",
  description: "了解我們的品牌故事與工藝理念。",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14 font-body text-sm leading-relaxed">
      <h1 className="font-display text-2xl italic text-walnut">關於我們</h1>
      <div className="grain-divider my-8" />
      <p className="text-ink">在這裡放品牌故事、選材理念、工藝流程或品牌照片，有助於建立信任感與 SEO 內容豐富度。</p>
    </div>
  );
}
