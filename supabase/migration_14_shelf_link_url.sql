-- ============================================
-- 第十四次遷移：商品貨架加上「查看更多」連結
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

alter table product_shelves add column link_url text;
