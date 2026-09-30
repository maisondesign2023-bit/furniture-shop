-- ============================================
-- 第 20 次遷移：取消商品個別「注意事項」欄位，改成全站統一的注意事項內容
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

alter table products drop column if exists notes;

insert into site_pages (slug, title, content) values
  ('product-notice', '商品注意事項', '請在後台編輯這裡的內容，這段文字會統一顯示在每個商品頁的「加入購物車」和「商品敘述」中間。');
