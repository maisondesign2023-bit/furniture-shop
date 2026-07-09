-- ============================================
-- 第十一次遷移：案例加上空間類型（住家空間 / 商業空間）
-- 在 Supabase SQL Editor 貼上執行
-- ============================================

alter table case_studies
  add column space_type text not null default 'residential'
  check (space_type in ('residential', 'commercial'));
