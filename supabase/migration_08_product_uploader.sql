-- ============================================
-- 第八次遷移：商品加上「上架人員」欄位（內部管理用，客人看不到）
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

alter table products add column created_by uuid references profiles(id);

-- 方便之後在後台依上架人員篩選
create index products_created_by_idx on products(created_by);
