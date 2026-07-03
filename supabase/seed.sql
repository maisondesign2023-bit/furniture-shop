-- 範例分類資料（可依實際商品線調整/刪除）
insert into categories (name, slug, sort_order) values
  ('客廳', 'living-room', 1),
  ('臥室', 'bedroom', 2),
  ('餐廚', 'dining', 3),
  ('燈飾', 'lighting', 4);

-- 建立好帳號後，把自己設為管理員（把 EMAIL 換成你的註冊信箱）：
-- update profiles set is_admin = true
-- where id = (select id from auth.users where email = 'you@example.com');
