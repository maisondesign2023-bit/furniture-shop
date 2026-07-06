-- ============================================
-- 第七次遷移：訂單通知信功能，訂單需要記錄 email
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

alter table orders add column email text;
