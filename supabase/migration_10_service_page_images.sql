-- ============================================
-- 第十次遷移：家配師服務頁面圖片（Hero + 四大服務圖庫）
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

-- 服務介紹頁的可編輯圖片區塊
-- section: 'hero'（首圖）/ 'furniture_design'（傢俱設計）/ 'space_planning'（規劃配置）
--          / 'decor_styling'（軟裝搭配）/ 'furniture_rental'（家具租借）
create table service_page_images (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in (
    'hero', 'furniture_design', 'space_planning', 'decor_styling', 'furniture_rental'
  )),
  url text not null,
  alt text,
  sort_order int default 0,
  created_at timestamptz default now()
);
create index service_page_images_section_idx on service_page_images(section);

-- ============================================
-- Row Level Security
-- ============================================
alter table service_page_images enable row level security;

create policy "service page images are publicly readable"
  on service_page_images for select using (true);

create policy "admins manage service page images"
  on service_page_images for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- 圖片檔案直接沿用既有的 case-images storage bucket，不需要新增 bucket 或額外的 storage policy。
