import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "edge";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-6 py-10">
      <aside className="w-48 shrink-0">
        <p className="font-display text-walnut">後台管理</p>
        <nav className="mt-6 flex flex-col gap-3 font-body text-sm">
          <Link href="/admin" className="hover:text-brass">總覽</Link>
          <Link href="/admin/products" className="hover:text-brass">商品管理</Link>
          <Link href="/admin/shelves" className="hover:text-brass">商品貨架管理</Link>
          <Link href="/admin/orders" className="hover:text-brass">訂單管理</Link>
          <Link href="/admin/members" className="hover:text-brass">會員管理</Link>
          <Link href="/admin/blog" className="hover:text-brass">部落格管理</Link>
          <Link href="/admin/cases" className="hover:text-brass">案例管理</Link>
          <Link href="/admin/services-page" className="hover:text-brass">家配師服務頁面圖片</Link>
          <Link href="/admin/contacts" className="hover:text-brass">預約諮詢訊息</Link>
          <Link href="/admin/banners" className="hover:text-brass">首頁圖片管理</Link>
          <Link href="/admin/pages" className="hover:text-brass">頁面內容管理</Link>
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
