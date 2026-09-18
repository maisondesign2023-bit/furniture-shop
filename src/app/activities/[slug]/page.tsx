import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { createPublicSupabase } from "@/lib/supabase/public";
import type { Activity } from "@/types";
import { buildMetadata } from "@/lib/seo";

export const runtime = "edge";

// 這頁流量低，改成每次都抓最新資料，確保後台編輯完前台馬上看得到
export const revalidate = 0;

async function getActivity(slug: string) {
  const supabase = createPublicSupabase();
  const { data } = await supabase
    .from("activities")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data as Activity | null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const activity = await getActivity(params.slug);
  if (!activity) return {};
  return buildMetadata({
    title: activity.seo_title || activity.title,
    description: activity.seo_description || activity.excerpt || activity.title,
    path: `/activities/${activity.slug}`,
    image: activity.cover_image ?? undefined,
  });
}

export default async function ActivityPage({
  params,
}: {
  params: { slug: string };
}) {
  const activity = await getActivity(params.slug);
  if (!activity) notFound();

  return (
    <article className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-display text-3xl font-semibold text-walnut">{activity!.title}</h1>
      {activity!.published_at && (
        <p className="mt-3 font-mono text-xs text-muted">
          {new Date(activity!.published_at).toLocaleDateString("zh-TW")}
        </p>
      )}

      {activity!.cover_image && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-surface">
          <Image
            src={activity!.cover_image}
            alt={activity!.title}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      <div
        className="rich-content mt-8"
        dangerouslySetInnerHTML={{ __html: activity!.content || "" }}
      />
    </article>
  );
}
