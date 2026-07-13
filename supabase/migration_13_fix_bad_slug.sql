-- ============================================
-- 第十三次遷移：修正商品 slug 帶空白導致的 404
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

update products
set slug = 'nube-sofa'
where slug = 'Nube sofa';
