-- ============================================
-- 第 18 次遷移：最新活動（做法跟部落格文章一樣）
-- 在 Supabase SQL Editor 貼上執行（不會影響原本的商品/訂單資料）
-- 圖片沿用既有的 blog-images bucket，不需要另外建立新的 bucket
-- ============================================

create table activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  cover_image text,
  excerpt text,           -- 摘要，顯示在列表
  content text,           -- 活動內文
  status text not null default 'draft' check (status in ('draft','published')),
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index activities_status_idx on activities(status);

alter table activities enable row level security;

create policy "published activities are publicly readable"
  on activities for select using (status = 'published');

create policy "admins manage activities"
  on activities for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
