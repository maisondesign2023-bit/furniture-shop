-- ============================================
-- 第九次遷移：關於我們頁面改成後台可編輯
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

insert into site_pages (slug, title, content) values
  ('about', '關於我們', '請在後台編輯這裡的內容，可以放品牌故事、選材理念、工藝流程，也可以插入照片。')
on conflict (slug) do nothing;

-- ============================================
-- Storage（要先在 Storage 建立 site-images 這個 public bucket，
-- 給「關於我們」等一般頁面的圖文編輯器使用）
-- ============================================
create policy "public can view site images"
on storage.objects for select
using (bucket_id = 'site-images');

create policy "admins can upload site images"
on storage.objects for insert
with check (
  bucket_id = 'site-images'
  and exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
