import Link from "next/link";
import Image from "next/image";
import { createPublicSupabase } from "@/lib/supabase/public";
import type { CaseStudy, ServicePageImage, ServicePageSection } from "@/types";
import { buildMetadata } from "@/lib/seo";
import ContactForm from "@/components/ContactForm";
import { getCoverImage } from "@/lib/get-cover-image";

export const runtime = "edge";

export const metadata = buildMetadata({
  title: "家配師服務",
  description: "一對一空間規劃與家具配置諮詢服務，看過去案例、線上預約諮詢。",
  path: "/services",
});

// 這頁流量低，改成每次都抓最新資料，確保後台編輯完前台馬上看得到
export const revalidate = 0;

const INTRO_CARDS = [
  { num: "01", title: "傢俱設計", description: "依照尺寸、機能、色彩與面料需求，提供訂製家具與量身配置建議。" },
  { num: "02", title: "規劃配置", description: "梳理生活動線與風格方向，協助全屋家具配置、配送與安裝一次到位。" },
  { num: "03", title: "軟裝搭配", description: "透過藝品、燈飾、織品與陳列，補上空間的情緒與層次。" },
];

const SERVICES: {
  section: ServicePageSection;
  num: string;
  title: string;
  description: string;
  tags: string[];
}[] = [
  {
    section: "furniture_design",
    num: "01 / FURNITURE DESIGN",
    title: "傢俱設計",
    description:
      "不是把家具塞進空間，而是讓家具回應屋主的使用習慣。從訂製尺寸、材質比例、色彩面料到收納機能，讓每一件家具都長在生活需要的位置。",
    tags: ["訂製家具", "量身訂做", "色彩選配", "面料搭配"],
  },
  {
    section: "space_planning",
    num: "02 / SPACE PLANNING",
    title: "規劃配置",
    description:
      "依照家庭成員、坪數、動線與預算，提供趨勢風格建議與全屋配置。從需求訪談到運送安裝，讓採購與落地過程更有效率。",
    tags: ["需求梳理", "趨勢風格建議", "全屋配置", "配送安裝"],
  },
  {
    section: "decor_styling",
    num: "03 / DECOR STYLING",
    title: "軟裝搭配",
    description:
      "軟裝是空間的最後一層呼吸。藉由藝品、花器、畫作、織品與擺件，讓家更有溫度，也讓商業空間擁有可被記住的氣質。",
    tags: ["藝品搭配", "陳列提案", "織品配置", "風格整合"],
  },
];

const PROCESS_STEPS = [
  { title: "01 需求訪談", description: "了解空間尺寸、生活習慣、風格喜好與預算。" },
  { title: "02 風格方向", description: "整理色系、材質、家具比例與整體情境。" },
  { title: "03 家具提案", description: "提供訂製、選品、租借或軟裝搭配建議。" },
  { title: "04 配送安裝", description: "協助安排運送、現場安裝與配置確認。" },
  { title: "05 完成調整", description: "微調陳列細節，讓空間更接近日常使用。" },
];

async function getServicePageImages() {
  const supabase = createPublicSupabase();
  const { data } = await supabase
    .from("service_page_images")
    .select("*")
    .order("sort_order");
  const images = (data as ServicePageImage[] | null) ?? [];
  const bySection = (section: ServicePageSection) =>
    images.filter((img) => img.section === section);
  return {
    hero: bySection("hero"),
    furniture_design: bySection("furniture_design"),
    space_planning: bySection("space_planning"),
    decor_styling: bySection("decor_styling"),
  };
}

export default async function ServicesPage() {
  const supabase = createPublicSupabase();
  const [{ data: cases }, sectionImages] = await Promise.all([
    supabase
      .from("case_studies")
      .select("*, case_study_images(*)")
      .eq("status", "published")
      .order("sort_order"),
    getServicePageImages(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-surface/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1fr_1.3fr] md:items-center">
          <div>
            <div className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-wide2 text-brass">
              <span className="h-px w-8 bg-brass" />
              Home Styling Service
            </div>
            <h1 className="font-display text-4xl font-semibold leading-tight text-walnut md:text-5xl">
              讓家的樣子，
              <br />
              剛好貼合生活。
            </h1>
            <p className="mt-6 max-w-md font-body text-sm leading-loose text-ink">
              從單件訂製、全屋配置到軟裝陳列，家配師協助梳理需求、整合風格與預算，讓家具與空間不只是好看，更能被日常自然使用。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="rounded-full bg-walnut px-6 py-3 font-body text-sm text-surface hover:bg-brass"
              >
                預約家配諮詢
              </a>
              <a
                href="#services"
                className="rounded-full border border-walnut px-6 py-3 font-body text-sm text-walnut hover:border-brass hover:text-brass"
              >
                查看服務內容
              </a>
            </div>
          </div>
          <HeroImages images={sectionImages.hero} />
        </div>
      </section>

      {/* 四大服務項目 */}
      <section id="services" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 grid gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-end">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-wide2 text-brass">SERVICE</p>
            <h2 className="font-display text-2xl font-semibold text-walnut md:text-3xl">三大服務項目</h2>
          </div>
          <p className="font-body text-sm leading-relaxed text-ink">
            從家具本體、空間規劃到軟裝細節，家配師提供一套完整的服務架構，陪您把想法落地成真正能用的空間。
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {INTRO_CARDS.map((card) => (
            <div key={card.num} className="rounded-[22px] border border-line bg-paper p-6">
              <span className="font-mono text-xs text-brass">{card.num}</span>
              <h3 className="mt-4 font-display text-lg font-semibold text-walnut">{card.title}</h3>
              <p className="mt-3 font-body text-xs leading-relaxed text-ink">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 四個服務區塊，各配一組圖庫 */}
      <section className="bg-surface/50 py-4">
        <div className="mx-auto max-w-6xl px-6">
          {SERVICES.map((service, i) => (
            <div
              key={service.section}
              className={`grid gap-10 py-16 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-start ${
                i > 0 ? "border-t border-line" : ""
              }`}
            >
              <div className="md:sticky md:top-28">
                <span className="font-mono text-xs tracking-wide2 text-brass">{service.num}</span>
                <h3 className="mt-3 font-display text-2xl font-semibold text-walnut md:text-3xl">
                  {service.title}
                </h3>
                <p className="mt-4 font-body text-sm leading-relaxed text-ink">{service.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-line bg-paper px-3 py-1.5 font-body text-xs text-ink"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <ServiceGallery images={sectionImages[service.section]} />
            </div>
          ))}
        </div>
      </section>

      {/* 服務流程 */}
      <section id="process" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 grid gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-end">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-wide2 text-brass">PROCESS</p>
            <h2 className="font-display text-2xl font-semibold text-walnut md:text-3xl">從需求到完成，清楚推進</h2>
          </div>
          <p className="font-body text-sm leading-relaxed text-ink">了解每一步在做什麼，降低第一次諮詢的門檻。</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PROCESS_STEPS.map((step) => (
            <div key={step.title} className="rounded-[18px] border border-line bg-paper p-5">
              <strong className="block font-body text-sm font-semibold text-walnut">{step.title}</strong>
              <p className="mt-2 font-body text-xs leading-relaxed text-ink">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 過去案例 */}
      <div className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="font-display text-2xl font-semibold uppercase text-walnut">PRODUCTS</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
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

      {/* 預約諮詢 */}
      <div id="contact" className="mx-auto max-w-2xl px-6 pb-20">
        <h2 className="font-display text-2xl font-semibold text-walnut">預約諮詢</h2>
        <div className="grain-divider my-8" />
        <ContactForm />
      </div>
    </div>
  );
}

function HeroImages({ images }: { images: ServicePageImage[] }) {
  const [first, second] = images;
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="translate-y-8">
        <HeroImageFrame image={first} />
      </div>
      <HeroImageFrame image={second} />
    </div>
  );
}

function HeroImageFrame({ image }: { image?: ServicePageImage }) {
  return (
    <div className="relative aspect-[2/3] overflow-hidden rounded-[22px] bg-surface shadow-sm">
      {image ? (
        <Image
          src={image.url}
          alt={image.alt || ""}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center font-mono text-xs text-muted">尚未上傳圖片</div>
      )}
    </div>
  );
}

function ServiceGallery({ images }: { images: ServicePageImage[] }) {
  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-[18px] bg-surface font-mono text-xs text-muted">
        尚未上傳圖片
      </div>
    );
  }

  const [first, ...rest] = images;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-[18px] bg-surface">
        <Image
          src={first.url}
          alt={first.alt || ""}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      {rest.slice(0, 5).map((img) => (
        <div key={img.id} className="relative aspect-square overflow-hidden rounded-[18px] bg-surface">
          <Image
            src={img.url}
            alt={img.alt || ""}
            fill
            sizes="20vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
}
