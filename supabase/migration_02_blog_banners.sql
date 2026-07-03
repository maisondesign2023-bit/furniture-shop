-- ============================================
-- 第二次遷移：部落格 + 首頁 Banner 管理
-- 在 Supabase SQL Editor 貼上執行（不會影響原本的商品/訂單資料）
-- ============================================

-- 首頁 Banner（可管理多張輪播圖，用 is_active 控制要不要顯示）
create table banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  subtitle text,
  link_url text,          -- 點擊 Banner 要導去哪裡，例如 /category/living-room
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 部落格文章
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  cover_image text,
  excerpt text,           -- 摘要，顯示在列表跟「探索更多」下拉選單
  content text,           -- 文章內文
  status text not null default 'draft' check (status in ('draft','published')),
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index blog_posts_status_idx on blog_posts(status);

-- ============================================
-- Row Level Security
-- ============================================
alter table banners enable row level security;
alter table blog_posts enable row level security;

-- 所有人可讀：上架中的 banner / 已發布的文章
create policy "active banners are publicly readable"
  on banners for select using (is_active = true);

create policy "published posts are publicly readable"
  on blog_posts for select using (status = 'published');

-- 管理員可管理全部
create policy "admins manage banners"
  on banners for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "admins manage blog posts"
  on blog_posts for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================
-- Storage 權限（要先在 Storage 建立 blog-images 與 banner-images 兩個 public bucket）
-- ============================================
create policy "public can view blog images"
on storage.objects for select
using (bucket_id = 'blog-images');

create policy "admins can upload blog images"
on storage.objects for insert
with check (
  bucket_id = 'blog-images'
  and exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

create policy "public can view banner images"
on storage.objects for select
using (bucket_id = 'banner-images');

create policy "admins can upload banner images"
on storage.objects for insert
with check (
  bucket_id = 'banner-images'
  and exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
