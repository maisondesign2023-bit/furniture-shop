export const runtime = "edge";

import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import type { BlogPost } from "@/types";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "探索更多",
  description: "空間佈置靈感、選材知識、居家生活提案。",
  path: "/blog",
});

export const revalidate = 3600;

export default async function BlogListPage() {
  const supabase = createServerSupabase();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <h1 className="font-display text-3xl italic text-walnut">探索更多</h1>
      <div className="grain-divider my-8" />

      <div className="grid gap-10 md:grid-cols-2">
        {(posts as BlogPost[] | null)?.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden bg-surface">
              {post.cover_image && (
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
            </div>
            <h2 className="mt-4 font-display text-lg italic text-walnut">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="mt-2 font-body text-sm text-muted line-clamp-2">
                {post.excerpt}
              </p>
            )}
          </Link>
        ))}
        {(!posts || posts.length === 0) && (
          <p className="col-span-full font-body text-sm text-muted">
            尚未發布任何文章。
          </p>
        )}
      </div>
    </div>
  );
}
