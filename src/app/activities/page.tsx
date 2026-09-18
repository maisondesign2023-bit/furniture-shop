import Link from "next/link";
import Image from "next/image";
import { createPublicSupabase } from "@/lib/supabase/public";
import type { Activity } from "@/types";
import { buildMetadata } from "@/lib/seo";

export const runtime = "edge";

export const metadata = buildMetadata({
  title: "最新活動",
  description: "品牌活動、限時優惠與快閃訊息。",
  path: "/activities",
});

// 這頁流量低，改成每次都抓最新資料，確保後台編輯完前台馬上看得到
export const revalidate = 0;

export default async function ActivitiesPage() {
  const supabase = createPublicSupabase();
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <h1 className="font-display text-3xl font-semibold text-walnut">最新活動</h1>
      <div className="grain-divider my-8" />

      <div className="grid gap-10 md:grid-cols-2">
        {(activities as Activity[] | null)?.map((activity) => (
          <Link key={activity.id} href={`/activities/${activity.slug}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden bg-surface">
              {activity.cover_image && (
                <Image
                  src={activity.cover_image}
                  alt={activity.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-walnut">
              {activity.title}
            </h2>
            {activity.excerpt && (
              <p className="mt-2 font-body text-sm text-muted line-clamp-2">
                {activity.excerpt}
              </p>
            )}
          </Link>
        ))}
        {(!activities || activities.length === 0) && (
          <p className="col-span-full font-body text-sm text-muted">
            目前沒有進行中的活動，之後有促銷活動、生日慶、快閃店資訊都會公布在這裡。
          </p>
        )}
      </div>
    </div>
  );
}
