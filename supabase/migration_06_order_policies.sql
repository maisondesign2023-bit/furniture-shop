-- ============================================
-- 第六次遷移：補上會員建立訂單的權限規則
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

-- 之前只設定了「使用者能看自己的訂單」跟「管理員能管理全部」，
-- 漏掉了「一般已登入會員能建立訂單」，導致結帳時寫入 orders 被安全規則擋下來。

create policy "logged in users can create their own orders"
  on orders for insert
  with check (auth.uid() = user_id);

create policy "logged in users can create their own order items"
  on order_items for insert
  with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );
