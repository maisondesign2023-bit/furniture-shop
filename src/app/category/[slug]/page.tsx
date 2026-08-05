import { redirect } from "next/navigation";

export const runtime = "edge";

// 舊的分類頁改成單一頁面（/products）加左側詳細分類，這裡保留路由做轉址避免舊連結失效
export default function CategoryRedirect({ params }: { params: { slug: string } }) {
  redirect(`/products?category=${params.slug}`);
}
