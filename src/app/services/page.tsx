import Link from "next/link";
import Image from "next/image";
import { createPublicSupabase } from "@/lib/supabase/public";
import type { CaseStudy } from "@/types";
import { buildMetadata } from "@/lib/seo";
import ContactForm from "@/components/ContactForm";

export const runtime = "edge";

export const metadata = buildMetadata({
  title: "家配師服務",
  description: "一對一空間規劃與家具配置諮詢服務，看過去案例、線上預約諮詢。",
  path: "/services",
});

export const revalidate = 3600;

export default async function ServicesPage() {
  const supabase = createPublicSupabase();
  const { data: cases } = await supabase
    .from("case_studies")
    .select("*, case_study_images(*)")
    .eq("status", "published")
    .order("sort_order");

  return (
    <div>
      <div className="mx-auto max-w-2xl px-6 py-14 font-body text-sm leading-relaxed">
        <h1 className="font-display text-2xl font-semibold text-walnut">家配師服務</h1>
        <div className="grain-divider my-8" />
        <div className="space-y-6 text-ink">
          <p>
            由專業家配師提供一對一空間規劃諮詢，從動線、色系到家具尺寸配置，為你的空間量身打造合適的方案。
          </p>
        </div>
      </div>

      {/* 過去案例 */}
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="font-display text-2xl font-semibold text-walnut">過去案例</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {(cases as CaseStudy[] | null)?.map((c) => {
            const cover = c.case_study_images?.[0]?.url;
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
                <h3 className="mt-3 font-display text-base font-semibold text-walnut">
                  {c.title}
                </h3>
                {c.summary && (
                  <p className="mt-1 font-body text-xs text-muted line-clamp-2">
                    {c.summary}
                  </p>
                )}
              </Link>
            );
          })}
          {(!cases || cases.length === 0) && (
            <p className="col-span-full font-body text-sm text-muted">
              尚未發布任何案例。
            </p>
          )}
        </div>
      </div>

      {/* 聯絡表單 */}
      <div className="mx-auto max-w-2xl px-6 pb-20">
        <h2 className="font-display text-2xl font-semibold text-walnut">預約諮詢</h2>
        <div className="grain-divider my-8" />
        <ContactForm />
      </div>
    </div>
  );
}
