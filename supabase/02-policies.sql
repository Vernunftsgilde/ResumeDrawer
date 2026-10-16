-- ============================================================================
-- ResumeDrawer · 02-policies.sql
-- RLS 策略 + Storage 桶
-- 在 SQL Editor 整段粘贴运行；幂等，可重复执行
--
-- 权限总原则：
--   1) 所有人（含未登录的 anon）都能浏览已发布的模板 —— 这是索引站的前提
--   2) 只有登录用户能收藏、投稿
--   3) 用户只能看到自己投稿/收藏的内容
--   4) 写模板表只有管理员
--   5) 联系表单与外链失效上报允许匿名提交（权利人本人常常没有账号）
-- ============================================================================

--------------------------------------------------------------------------------
-- 1. 开启 RLS
--------------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.categories        enable row level security;
alter table public.tags              enable row level security;
alter table public.template_tags     enable row level security;
alter table public.templates         enable row level security;
alter table public.favorites         enable row level security;
alter table public.submissions       enable row level security;
alter table public.contact_messages  enable row level security;
alter table public.link_reports      enable row level security;

--------------------------------------------------------------------------------
-- 2. profiles
--------------------------------------------------------------------------------
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

--------------------------------------------------------------------------------
-- 3. categories / tags / template_tags —— 公开读，管理员写
--------------------------------------------------------------------------------
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "tags_public_read" on public.tags;
create policy "tags_public_read" on public.tags
  for select using (true);

drop policy if exists "tags_admin_write" on public.tags;
create policy "tags_admin_write" on public.tags
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "template_tags_public_read" on public.template_tags;
create policy "template_tags_public_read" on public.template_tags
  for select using (true);

drop policy if exists "template_tags_admin_write" on public.template_tags;
create policy "template_tags_admin_write" on public.template_tags
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

--------------------------------------------------------------------------------
-- 4. templates —— 核心：所有人读 published，管理员写
--------------------------------------------------------------------------------
drop policy if exists "templates_public_read" on public.templates;
create policy "templates_public_read" on public.templates
  for select using (status = 'published');

drop policy if exists "templates_admin_write" on public.templates;
create policy "templates_admin_write" on public.templates
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

--------------------------------------------------------------------------------
-- 5. favorites —— 只能操作自己的收藏
--------------------------------------------------------------------------------
drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 6. submissions —— 登录用户投稿；只看自己的；审核归管理员
--------------------------------------------------------------------------------
drop policy if exists "submissions_insert_own" on public.submissions;
create policy "submissions_insert_own" on public.submissions
  for insert to authenticated with check (auth.uid() is not null);

drop policy if exists "submissions_select_own_or_admin" on public.submissions;
create policy "submissions_select_own_or_admin" on public.submissions
  for select using (auth.uid() = submitted_by or public.is_admin());

drop policy if exists "submissions_admin_review" on public.submissions;
create policy "submissions_admin_review" on public.submissions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "submissions_delete_own_pending" on public.submissions;
create policy "submissions_delete_own_pending" on public.submissions
  for delete using (auth.uid() = submitted_by and status = 'pending');

--------------------------------------------------------------------------------
-- 7. contact_messages —— 允许匿名提交，只有管理员能看
--------------------------------------------------------------------------------
drop policy if exists "contact_insert_public" on public.contact_messages;
create policy "contact_insert_public" on public.contact_messages
  for insert with check (true);

drop policy if exists "contact_admin_read" on public.contact_messages;
create policy "contact_admin_read" on public.contact_messages
  for select using (public.is_admin());

drop policy if exists "contact_admin_update" on public.contact_messages;
create policy "contact_admin_update" on public.contact_messages
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

--------------------------------------------------------------------------------
-- 8. link_reports —— 允许匿名上报，只有管理员能看
--------------------------------------------------------------------------------
drop policy if exists "link_reports_insert_public" on public.link_reports;
create policy "link_reports_insert_public" on public.link_reports
  for insert with check (true);

drop policy if exists "link_reports_admin_read" on public.link_reports;
create policy "link_reports_admin_read" on public.link_reports
  for select using (public.is_admin());

--------------------------------------------------------------------------------
-- 9. Storage：previews 桶（预览图）
--    公开读；登录用户只能写自己 uid 目录下的文件
--------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('previews', 'previews', true, 5242880,
        array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880;

drop policy if exists "previews_public_read" on storage.objects;
create policy "previews_public_read" on storage.objects
  for select using (bucket_id = 'previews');

drop policy if exists "previews_insert_own_folder" on storage.objects;
create policy "previews_insert_own_folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'previews' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "previews_update_own_folder" on storage.objects;
create policy "previews_update_own_folder" on storage.objects
  for update to authenticated
  using (bucket_id = 'previews' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'previews' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "previews_delete_own_folder" on storage.objects;
create policy "previews_delete_own_folder" on storage.objects
  for delete to authenticated
  using (bucket_id = 'previews' and (storage.foldername(name))[1] = auth.uid()::text);
