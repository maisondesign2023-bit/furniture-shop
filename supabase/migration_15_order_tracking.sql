-- ============================================
-- 第十五次遷移：訂單加上物流資訊（快遞公司/單號/查詢連結）
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

alter table orders add column shipping_carrier text;
alter table orders add column tracking_number text;
alter table orders add column tracking_url text;
