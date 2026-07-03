-- ============================================
-- 第四次遷移：家配師服務（過去案例 + 聯絡表單）
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

-- 家配服務案例
create table case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  summary text,            -- 簡短摘要，顯示在下拉選單與案例列表
  content text,             -- 案例完整說明
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order int default 0,
  created_at timestamptz default now()
);
create index case_studies_status_idx on case_studies(status);

-- 案例圖片（最多可放多張，第一張為封面）
create table case_study_images (
  id uuid primary key default gen_random_uuid(),
  case_study_id uuid references case_studies(id) on delete cascade,
  url text not null,
  alt text,
  sort_order int default 0,
  created_at timestamptz default now()
);
create index case_study_images_case_idx on case_study_images(case_study_id);

-- 聯絡表單訊息（家配師服務頁面底部的表單送出後存在這裡）
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'new' check (status in ('new','read','replied')),
  created_at timestamptz default now()
);

-- ============================================
-- Row Level Security
-- ============================================
alter table case_studies enable row level security;
alter table case_study_images enable row level security;
alter table contact_messages enable row level security;

create policy "published case studies are publicly readable"
  on case_studies for select using (status = 'published');

create policy "case study images are publicly readable"
  on case_study_images for select using (true);

-- 聯絡表單：任何人都可以送出（不用登入），但只有管理員可以讀取
create policy "anyone can submit a contact message"
  on contact_messages for insert with check (true);

create policy "admins can view contact messages"
  on contact_messages for select using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "admins manage case studies"
  on case_studies for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "admins manage case study images"
  on case_study_images for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "admins manage contact messages"
  on contact_messages for update using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================
-- Storage（要先在 Storage 建立 case-images 這個 public bucket）
-- ============================================
create policy "public can view case images"
on storage.objects for select
using (bucket_id = 'case-images');

create policy "admins can upload case images"
on storage.objects for insert
with check (
  bucket_id = 'case-images'
  and exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
