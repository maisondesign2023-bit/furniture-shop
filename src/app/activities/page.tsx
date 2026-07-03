import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "最新活動",
  description: "品牌活動、限時優惠與快閃訊息。",
  path: "/activities",
});

export default function ActivitiesPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14 font-body text-sm leading-relaxed">
      <h1 className="font-display text-2xl italic text-walnut">最新活動</h1>
      <div className="grain-divider my-8" />
      <p className="text-ink">
        這裡可以放促銷活動、生日慶、快閃店資訊等內容。之後可以再幫你加上後台可管理的活動列表，做法跟部落格系統一樣。
      </p>
    </div>
  );
}
