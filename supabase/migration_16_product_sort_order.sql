-- ============================================
-- 第十六次遷移：商品加上可拖曳排序欄位
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

alter table products add column sort_order int default 0;
