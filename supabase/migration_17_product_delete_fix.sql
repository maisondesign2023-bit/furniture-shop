-- ============================================
-- 第十七次遷移：修正商品刪除失敗的問題
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

-- 原本 order_items.product_id 沒有設定刪除規則，只要商品曾經被下單過，
-- 刪除商品就會被資料庫擋下來（外鍵限制），畫面卻沒有顯示任何錯誤訊息。
-- order_items 本來就有存商品名稱/單價的快照，所以商品被刪除後，
-- 把歷史訂單裡的 product_id 設成 NULL 是安全的，不會遺失訂單資料。
alter table order_items drop constraint order_items_product_id_fkey;
alter table order_items add constraint order_items_product_id_fkey
  foreign key (product_id) references products(id) on delete set null;
