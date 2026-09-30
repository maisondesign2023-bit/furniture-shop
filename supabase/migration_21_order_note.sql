-- ============================================
-- 第 21 次遷移：訂單備註欄位
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

alter table orders add column note text;
