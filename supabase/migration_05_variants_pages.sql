-- ============================================
-- 第五次遷移：商品尺寸/顏色選項、可編輯頁面內容
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

-- 商品加上尺寸/顏色選項（陣列，例如 ['S','M','L']）
alter table products add column sizes text[] not null default '{}';
alter table products add column colors text[] not null default '{}';

-- 訂單明細加上「已選擇的尺寸/顏色」文字紀錄
alter table order_items add column variant text;

-- 可後台編輯的頁面內容（退換貨政策、隱私權政策等）
create table site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,      -- 例如 shipping-policy、privacy-policy
  title text not null,
  content text,
  updated_at timestamptz default now()
);

alter table site_pages enable row level security;

create policy "site pages are publicly readable"
  on site_pages for select using (true);

create policy "admins manage site pages"
  on site_pages for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- 先建立退換貨政策的預設內容，之後可以直接在後台編輯
insert into site_pages (slug, title, content) values
  ('shipping-policy', '運送與退換貨', '請在後台編輯這裡的內容，說明實際的運送方式、運費計算與退換貨規則。'),
  ('privacy-policy', '隱私權政策', '請在後台編輯這裡的內容，說明個人資料蒐集、使用與保護方式。');
