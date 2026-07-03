-- ============================================
-- 家具購物網站 資料庫 Schema
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

-- 會員資料（綁定 Supabase Auth）
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  address text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- 商品分類（支援巢狀，如 客廳 > 沙發）
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid references categories(id) on delete set null,
  sort_order int default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz default now()
);

-- 商品
create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2), -- 原價/劃線價，可選
  description text,               -- 商品敘述（可放材質、尺寸、保固等）
  sku text,
  stock int default 0,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  seo_title text,
  seo_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index products_category_idx on products(category_id);
create index products_status_idx on products(status);

-- 商品圖片（每個商品最多 10 張，用 sort_order 控制順序，第一張為主圖）
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  url text not null,
  alt text,
  sort_order int default 0,
  created_at timestamptz default now()
);
create index product_images_product_idx on product_images(product_id);

-- 訂單
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique not null,          -- 顯示給客人的訂單編號
  user_id uuid references profiles(id),
  status text not null default 'pending_payment'
    check (status in ('pending_payment','paid','processing','shipped','completed','cancelled','refunded')),
  subtotal numeric(10,2) not null,
  shipping_fee numeric(10,2) default 0,
  total numeric(10,2) not null,
  recipient_name text not null,
  recipient_phone text not null,
  shipping_address text not null,
  payment_provider text,       -- 'ecpay' | 'newebpay'
  payment_trade_no text,       -- 金流商回傳的交易編號
  paid_at timestamptz,
  created_at timestamptz default now()
);
create index orders_user_idx on orders(user_id);

-- 訂單明細
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,   -- 下單當下的名稱快照（避免商品改名影響歷史訂單）
  unit_price numeric(10,2) not null,
  quantity int not null,
  subtotal numeric(10,2) not null
);
create index order_items_order_idx on order_items(order_id);

-- ============================================
-- Row Level Security
-- ============================================
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- 分類/商品/圖片：所有人可讀已上架的內容
create policy "categories are publicly readable"
  on categories for select using (true);

create policy "published products are publicly readable"
  on products for select using (status = 'published');

create policy "product images are publicly readable"
  on product_images for select using (true);

-- 會員：只能看/改自己的資料
create policy "users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "users can update own profile"
  on profiles for update using (auth.uid() = id);

-- 訂單：只能看自己的訂單
create policy "users can view own orders"
  on orders for select using (auth.uid() = user_id);
create policy "users can view own order items"
  on order_items for select using (
    exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );

-- 後台管理（is_admin = true）：完整權限
create policy "admins manage categories"
  on categories for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
create policy "admins manage products"
  on products for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
create policy "admins manage product images"
  on product_images for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
create policy "admins manage orders"
  on orders for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
create policy "admins manage order items"
  on order_items for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- 新使用者註冊時自動建立 profile
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
