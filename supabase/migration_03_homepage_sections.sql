-- ============================================
-- 第三次遷移：首頁改版（最新消息 / 分隔圖片 / 商品貨架）
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

-- 幫 banners 加上類型欄位：hero（最新消息主圖）／ divider（分隔圖片）
alter table banners add column type text not null default 'hero'
  check (type in ('hero', 'divider'));

-- 商品貨架（首頁可以有多個貨架，例如「熱銷商品」「新品上市」）
create table product_shelves (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 貨架裡的商品（一個貨架可以放多個商品，用 sort_order 控制顯示順序）
create table shelf_products (
  id uuid primary key default gen_random_uuid(),
  shelf_id uuid references product_shelves(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  sort_order int default 0,
  created_at timestamptz default now(),
  unique(shelf_id, product_id)
);
create index shelf_products_shelf_idx on shelf_products(shelf_id);

-- ============================================
-- Row Level Security
-- ============================================
alter table product_shelves enable row level security;
alter table shelf_products enable row level security;

create policy "active shelves are publicly readable"
  on product_shelves for select using (is_active = true);

create policy "shelf products are publicly readable"
  on shelf_products for select using (true);

create policy "admins manage shelves"
  on product_shelves for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "admins manage shelf products"
  on shelf_products for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
