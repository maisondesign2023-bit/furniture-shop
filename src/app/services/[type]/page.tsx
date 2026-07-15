import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createPublicSupabase } from "@/lib/supabase/public";
import type { CaseStudy, CaseSpaceType } from "@/types";
import { buildMetadata } from "@/lib/seo";
import { getCoverImage } from "@/lib/get-cover-image";

export const runtime = "edge";

// 這頁流量低，改成每次都抓最新資料，確保後台編輯完前台馬上看得到
export const revalidate = 0;

const TYPE_LABELS: Record<CaseSpaceType, string> = {
  residential: "住家空間",
  commercial: "商業空間",
};

function isSpaceType(value: string): value is CaseSpaceType {
  return value === "residential" || value === "commercial";
}

export async function generateMetadata({
  params,
}: {
  params: { type: string };
}): Promise<Metadata> {
  if (!isSpaceType(params.type)) return {};
  const label = TYPE_LABELS[params.type];
  return buildMetadata({
    title: `${label}｜家配師服務`,
    description: `家配師服務過去案例 — ${label}`,
    path: `/services/${params.type}`,
  });
}

export default async function ServiceSpaceTypePage({
  params,
}: {
  params: { type: string };
}) {
  if (!isSpaceType(params.type)) notFound();

  const label = TYPE_LABELS[params.type];
  const supabase = createPublicSupabase();
  const { data: cases } = await supabase
    .from("case_studies")
    .select("*, case_study_images(*)")
    .eq("status", "published")
    .eq("space_type", params.type)
    .order("sort_order");

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <nav className="mb-8 font-mono text-xs text-muted">家配師服務 / {label}</nav>

      <h1 className="font-display text-3xl font-semibold text-walnut">{label}</h1>
      <p className="mt-3 font-mono text-xs uppercase tracking-wide2 text-brass">PRODUCTS</p>

      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {(cases as CaseStudy[] | null)?.map((c) => {
          const cover = getCoverImage(c.case_study_images);
          return (
            <Link key={c.id} href={`/services/case/${c.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                {cover && (
                  <Image
                    src={cover}
                    alt={c.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
              </div>
              <h3 className="mt-3 font-display text-base font-semibold text-walnut">{c.title}</h3>
              {c.summary && <p className="mt-1 font-body text-xs text-muted line-clamp-2">{c.summary}</p>}
            </Link>
          );
        })}
        {(!cases || cases.length === 0) && (
          <p className="col-span-full font-body text-sm text-muted">尚未發布任何案例。</p>
        )}
      </div>
    </div>
  );
}
