-- ============================================================================
-- ResumeDrawer · 06-patch.sql
-- 增量补丁：修掉 01–05 遗留的几个问题。全部幂等，可重复运行。
--
--   D1  submissions.submitted_by 没有默认值 → 恒为 NULL → RLS 里
--       「auth.uid() = submitted_by」永远不成立，用户查不到自己提交的东西
--   D2  全库没有表级 GRANT → anon / authenticated 可能完全读写不了
--   D3  search_norm 只含 title/summary/source_* → 搜分类名和标签搜不到，
--       线上搜索结果比演示模式少
--   D4  审核只改 status，reviewed_by / reviewed_at 永远是空
--   D5  筛选用到的几个列没有索引，数据量上来后全表扫
--
-- 前置：先跑完 01-schema.sql → 02-policies.sql → 03-rpc.sql → 04-seed.sql
-- 运行：SQL Editor 整段粘贴执行；之后可跑 05-verify.sql 验收
-- ============================================================================

begin;

--------------------------------------------------------------------------------
-- D1. submissions.submitted_by 默认取当前登录用户
--
-- 前端 createSubmission 不传 submitted_by，靠数据库兜底。
-- 没有这个 default，投稿会静默变成「匿名投稿」，用户永远查不到自己的记录。
--------------------------------------------------------------------------------
alter table public.submissions
  alter column submitted_by set default auth.uid();

--------------------------------------------------------------------------------
-- D4. 审核人 / 审核时间自动落库
--------------------------------------------------------------------------------
alter table public.submissions
  alter column reviewed_by set default auth.uid();

create or replace function public.tg_submissions_review_stamp()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status and new.status in ('approved', 'rejected') then
    new.reviewed_at := coalesce(new.reviewed_at, now());
    new.reviewed_by := coalesce(new.reviewed_by, auth.uid());
  end if;
  return new;
end
$$;

drop trigger if exists trg_submissions_review_stamp on public.submissions;
create trigger trg_submissions_review_stamp
  before update on public.submissions
  for each row execute function public.tg_submissions_review_stamp();

--------------------------------------------------------------------------------
-- D3. search_norm 纳入分类名与标签名
--
-- 原来只拼 title / summary / source_name / source_author，
-- 于是搜「互联网」「极简」这类落在分类名或标签上的词是搜不到的。
--------------------------------------------------------------------------------
create or replace function public.tg_templates_search_norm()
returns trigger
language plpgsql
as $$
declare
  v_cat  text := '';
  v_tags text := '';
begin
  select coalesce(c.name, '')
    into v_cat
  from public.categories c
  where c.id = new.category_id;

  select coalesce(string_agg(tg.name, ' '), '')
    into v_tags
  from public.template_tags tt
  join public.tags tg on tg.id = tt.tag_id
  where tt.template_id = new.id;

  new.search_norm := public.norm_text(
    coalesce(new.title, '')         || ' ' ||
    coalesce(new.summary, '')       || ' ' ||
    coalesce(new.source_name, '')   || ' ' ||
    coalesce(new.source_author, '') || ' ' ||
    v_cat                           || ' ' ||
    v_tags
  );
  return new;
end
$$;

-- 换分类也要重算，所以把 category_id 加进触发列
drop trigger if exists trg_templates_search_norm on public.templates;
create trigger trg_templates_search_norm
  before insert or update of title, summary, source_name, source_author, category_id
  on public.templates
  for each row execute function public.tg_templates_search_norm();

-- 标签增删后刷新所属模板的 search_norm
-- （只改 search_norm，不会再次触发上面的 BEFORE UPDATE OF ... 触发器，无递归）
create or replace function public.tg_template_tags_refresh_norm()
returns trigger
language plpgsql
as $$
declare
  v_id uuid := case tg_op when 'DELETE' then old.template_id else new.template_id end;
begin
  update public.templates t
     set search_norm = public.norm_text(
           coalesce(t.title, '')         || ' ' ||
           coalesce(t.summary, '')       || ' ' ||
           coalesce(t.source_name, '')   || ' ' ||
           coalesce(t.source_author, '') || ' ' ||
           coalesce((select c.name from public.categories c where c.id = t.category_id), '') || ' ' ||
           coalesce((
             select string_agg(tg.name, ' ')
             from public.template_tags tt
             join public.tags tg on tg.id = tt.tag_id
             where tt.template_id = t.id
           ), '')
         )
   where t.id = v_id;
  return null;
end
$$;

drop trigger if exists trg_template_tags_refresh_norm on public.template_tags;
create trigger trg_template_tags_refresh_norm
  after insert or update or delete on public.template_tags
  for each row execute function public.tg_template_tags_refresh_norm();

-- 把 04-seed 已经灌进去的数据重算一遍
update public.templates t
   set search_norm = public.norm_text(
         coalesce(t.title, '')         || ' ' ||
         coalesce(t.summary, '')       || ' ' ||
         coalesce(t.source_name, '')   || ' ' ||
         coalesce(t.source_author, '') || ' ' ||
         coalesce((select c.name from public.categories c where c.id = t.category_id), '') || ' ' ||
         coalesce((
           select string_agg(tg.name, ' ')
           from public.template_tags tt
           join public.tags tg on tg.id = tt.tag_id
           where tt.template_id = t.id
         ), '')
       );

--------------------------------------------------------------------------------
-- D5. 补索引
--------------------------------------------------------------------------------
create index if not exists idx_templates_license    on public.templates (license_type);
create index if not exists idx_templates_layout     on public.templates (layout);
create index if not exists idx_templates_audience   on public.templates (audience);
create index if not exists idx_templates_ats        on public.templates (ats_friendly) where ats_friendly;
create index if not exists idx_templates_cat_status on public.templates (category_id, status, published_at desc);
create index if not exists idx_contact_status       on public.contact_messages (status, created_at desc);
create index if not exists idx_link_reports_created on public.link_reports (created_at desc);
create index if not exists idx_submissions_cat      on public.submissions (category_slug)
  where category_slug is not null;

--------------------------------------------------------------------------------
-- D2. 表级 GRANT
--
-- 01-schema.sql 建了表、02-policies.sql 开了 RLS，但没有把表的 DML 权限授给
-- anon / authenticated。Supabase 新项目里 public schema 的默认权限有时会被清掉，
-- 此时即使策略写得对，前端依然会拿到 42501（permission denied for table）。
-- 这里显式授予；真实可访问范围仍然由 02-policies.sql 的 RLS 策略决定，
-- grant 只是「允许进这道门」，策略才决定「能看哪些行」。
--------------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

-- 只读字典表
grant select on public.categories     to anon, authenticated;
grant select on public.tags           to anon, authenticated;
grant select on public.template_tags  to anon, authenticated;

-- 模板：所有人可读（published 过滤由 RLS 管）
grant select on public.templates      to anon, authenticated;

-- 收藏：登录用户本人读写
grant select, insert, delete on public.favorites to authenticated;

-- 投稿：登录用户提交、查看自己的、撤回自己的 pending；
--       管理员审核走 update（谁能 update 由 RLS 的 admin 分支判定）
grant select, insert, delete, update on public.submissions to authenticated;

-- 联系与失效上报：允许匿名提交（下架申请常常来自非登录的权利人本人）
grant insert on public.contact_messages to anon, authenticated;
grant insert on public.link_reports     to anon, authenticated;

-- profiles：本人可读
grant select on public.profiles to authenticated;

commit;

-- ============================================================================
-- 验收（单独执行，不要放在上面的事务里）
-- ============================================================================
-- -- 1) 匿名视角：能读模板、能搜
-- set local role anon;
-- select count(*) > 0 as anon_can_read_templates from public.templates;
-- select count(*) >= 0 as anon_can_search from public.search_templates(p_q => '简历');
-- reset role;
--
-- -- 2) 登录视角：能投稿，且 submitted_by 会自动填上
-- set local role authenticated;
-- set local request.jwt.claim.sub = '<换成真实 user id>';
-- insert into public.submissions (title, source_name, source_url, download_url, file_formats)
-- values ('冒烟测试', '测试来源', 'https://example.com/a', 'https://example.com/a.docx', '{docx}')
-- returning id, submitted_by;   -- submitted_by 应当等于上面那个 user id，而不是 NULL
-- rollback;
