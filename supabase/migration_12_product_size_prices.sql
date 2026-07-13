-- ============================================
-- 第十二次遷移：商品尺寸各自的價格
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

-- 每個尺寸可以有自己的價格，例如 [{"label":"S","price":1000},{"label":"M","price":1200}]
-- 留空陣列代表這個商品沒有尺寸選項，沿用 products.price 當作唯一價格
alter table products add column size_prices jsonb not null default '[]';

-- 幫既有商品把舊的 sizes 標籤帶進來，價格先預設用目前的 price，之後可以到後台個別調整
update products
set size_prices = (
  select coalesce(jsonb_agg(jsonb_build_object('label', s, 'price', products.price)), '[]'::jsonb)
  from unnest(sizes) as s
)
where sizes is not null and array_length(sizes, 1) > 0;
