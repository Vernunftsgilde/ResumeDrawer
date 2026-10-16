-- ============================================================================
-- ResumeDrawer · 01-schema.sql
-- 扩展 → 建表 → 函数 → 触发器 → 索引
-- 在 Supabase Dashboard → SQL Editor 整段粘贴运行；幂等，可重复执行
--
-- ⚠️ 顺序说明（本文件唯一的结构约束）：
--    建表必须排在 SQL 语言函数之前。PostgreSQL 默认 check_function_bodies = on，
--    创建 language sql 函数时会解析函数体并校验其中引用的表是否存在。
--    若把 public.is_admin()（引用 public.profiles）放在建表之前，会直接报
--    42P01: relation "public.profiles" does not exist。
--    plpgsql 函数不受此限制（创建时不解析 SQL 语句），但为了一致也一并后置。
-- ============================================================================

--------------------------------------------------------------------------------
-- 0. 扩展
--    pg_trgm  : 三元相似度，中英文子串搜索都可用（to_tsvector 对中文无效，不用它）
--    unaccent : 去音标，让 "resume" 能匹配 "résumé"
--------------------------------------------------------------------------------
create extension if not exists pg_trgm  with schema extensions;
create extension if not exists unaccent with schema extensions;

--------------------------------------------------------------------------------
-- 1. 表（按外键依赖顺序：被引用的先建）
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- 1.1 profiles —— 公开用户资料，与 auth.users 一对一
--------------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  role         text not null default 'user' check (role in ('user', 'admin')),
  created_at   timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- 1.2 categories —— 一级分类（职能 / 行业场景）
--------------------------------------------------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  short_desc text,
  color_hex  text not null default '#2563EB',
  icon       text,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- 1.3 tags —— 标签字典
--------------------------------------------------------------------------------
create table if not exists public.tags (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  kind       text not null default 'topic' check (kind in ('topic', 'feature', 'style', 'industry')),
  created_at timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- 1.4 templates —— 核心表
--    只存元信息与预览图；模板文件一律不托管，下载走外链
--------------------------------------------------------------------------------
create table if not exists public.templates (
  id          uuid primary key default gen_random_uuid(),

  -- 基础
  slug        text not null unique,
  title       text not null check (char_length(btrim(title)) between 2 and 120),
  summary     text check (char_length(summary) <= 300),
  description text,

  -- 归属
  category_id uuid not null references public.categories(id) on delete restrict,

  -- 筛选维度（全部用 TEXT + CHECK，方便后续加字典值；PG enum 改值在 SQL Editor 里容易报错）
  layout          text not null default 'single-column'
                    check (layout in ('single-column', 'two-column', 'sidebar', 'timeline',
                                      'portfolio', 'infographic', 'minimal')),
  audience        text not null default 'general'
                    check (audience in ('campus', 'intern', 'fresh-grad', 'junior', 'mid',
                                        'senior', 'executive', 'career-changer', 'general')),
  color_tone      text not null default 'mono'
                    check (color_tone in ('mono', 'blue', 'navy', 'green', 'warm-orange',
                                          'wine', 'morandi', 'colorful', 'dark')),
  accent_hex      text,
  has_photo_slot  boolean not null default false,
  ats_friendly    boolean not null default true,
  languages       text[] not null default array['zh']::text[],
  file_formats    text[] not null default '{}'::text[],
  page_count      smallint check (page_count between 1 and 30),
  license_type    text not null default 'unknown'
                    check (license_type in ('free-commercial', 'free-personal', 'account-required',
                                            'cc-by', 'cc0', 'oss', 'unknown')),
  license_note    text,

  -- 来源（版权合规的核心字段，缺一不可）
  source_name     text not null,
  source_author   text,
  source_url      text not null check (source_url ~ '^https?://'),
  download_url    text not null check (download_url ~ '^https?://'),

  -- 预览：generated = 前端程序化生成占位图；self-hosted = 存在 Supabase Storage；remote = 外链
  preview_url          text,
  preview_storage_path text,
  preview_kind         text not null default 'generated'
                         check (preview_kind in ('generated', 'self-hosted', 'remote')),
  preview_width        int,
  preview_height       int,

  -- 生命周期
  status       text not null default 'published' check (status in ('draft', 'published', 'takedown')),
  featured     boolean not null default false,
  submitted_by uuid references auth.users(id) on delete set null,

  -- 计数与外链巡检
  view_count          bigint not null default 0,
  download_count      bigint not null default 0,
  favorite_count      bigint not null default 0,
  broken_report_count int    not null default 0,
  link_status         text not null default 'unknown' check (link_status in ('ok', 'broken', 'unknown')),
  link_checked_at     timestamptz,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz not null default now(),

  -- 搜索归一化列（由触发器维护，见第 3 节）
  search_norm  text
);

comment on table  public.templates is '简历模板索引：只存元信息与预览图，模板文件一律走外链';
comment on column public.templates.status is 'published 对外可见；takedown 用于收到下架通知后下线但保留记录';
comment on column public.templates.link_status is '外链巡检标记，配合 link_checked_at 做定期复查';
comment on column public.templates.search_norm is '归一化搜索文本（小写 + 去音标），由触发器自动维护';

--------------------------------------------------------------------------------
-- 1.5 template_tags —— 模板 × 标签（多对多，必须在 templates 与 tags 之后）
--------------------------------------------------------------------------------
create table if not exists public.template_tags (
  template_id uuid not null references public.templates(id) on delete cascade,
  tag_id      uuid not null references public.tags(id) on delete cascade,
  primary key (template_id, tag_id)
);

--------------------------------------------------------------------------------
-- 1.6 favorites —— 收藏
--------------------------------------------------------------------------------
create table if not exists public.favorites (
  user_id     uuid not null references auth.users(id) on delete cascade,
  template_id uuid not null references public.templates(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, template_id)
);

--------------------------------------------------------------------------------
-- 1.7 submissions —— 用户投稿（需审核）
--------------------------------------------------------------------------------
create table if not exists public.submissions (
  id             uuid primary key default gen_random_uuid(),
  submitted_by   uuid references auth.users(id) on delete set null,
  title          text not null check (char_length(btrim(title)) between 2 and 120),
  source_name    text not null,
  source_author  text,
  source_url     text not null check (source_url ~ '^https?://'),
  download_url   text not null check (download_url ~ '^https?://'),
  category_slug  text,
  file_formats   text[] not null default '{}'::text[],
  layout         text,
  license_type   text not null default 'unknown'
                   check (license_type in ('free-commercial', 'free-personal', 'account-required',
                                           'cc-by', 'cc0', 'oss', 'unknown')),
  license_note   text,
  note           text,
  status         text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note    text,
  reviewed_by    uuid references auth.users(id) on delete set null,
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.submissions is '用户投稿的模板索引，默认 pending，管理员审核后入库';

--------------------------------------------------------------------------------
-- 1.8 contact_messages —— 联系 / 下架 / 纠错 / 推荐
--    未登录也要能提交（下架申请常常来自权利人本人），所以允许 anon insert
--------------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  type        text not null default 'general'
                check (type in ('general', 'takedown', 'correction', 'suggestion')),
  email       text,
  subject     text,
  body        text not null check (char_length(btrim(body)) between 5 and 4000),
  target_slug text,
  user_id     uuid references auth.users(id) on delete set null,
  status      text not null default 'new' check (status in ('new', 'reading', 'done')),
  created_at  timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- 1.9 link_reports —— 外链失效上报
--------------------------------------------------------------------------------
create table if not exists public.link_reports (
  id           uuid primary key default gen_random_uuid(),
  template_id  uuid not null references public.templates(id) on delete cascade,
  reason       text check (reason in ('404', 'login-required', 'moved', 'malware', 'other')),
  detail       text,
  reporter_id  uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- 2. 函数（全部置于建表之后）
--------------------------------------------------------------------------------

-- unaccent() 在 PG 里是 STABLE（要按 search_path 找字典），不能直接进索引表达式。
-- 包一层 IMMUTABLE 壳并把字典钉死，才能安全用在索引与触发器里。
create or replace function public.immutable_unaccent(p_text text)
returns text
language sql
immutable parallel safe strict
set search_path = public, extensions
as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, p_text)
$$;

-- 归一化搜索文本：小写 + 去音标
create or replace function public.norm_text(p_text text)
returns text
language sql
immutable parallel safe
set search_path = public, extensions
as $$
  select lower(public.immutable_unaccent(coalesce(p_text, '')))
$$;

-- 是否为管理员。SECURITY DEFINER 是关键：以函数所有者身份读 profiles，
-- 避免与 profiles 自身的 RLS 形成递归。
-- 引用的 public.profiles 已在第 1.1 节创建。
create or replace function public.is_admin()
returns boolean
language sql
stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
$$;

-- updated_at 自动维护
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

-- slug 兜底生成（中文标题会被洗成空串，此时退化为 t-<hash>）
create or replace function public.slugify(p_text text)
returns text
language sql
immutable parallel safe
set search_path = public, extensions
as $$
  select regexp_replace(
           regexp_replace(lower(public.immutable_unaccent(coalesce(p_text, ''))), '[^a-z0-9]+', '-', 'g'),
           '(^-+|-+$)', '', 'g')
$$;

-- 新用户注册时自动补一行 profiles
-- 这是 profiles 行的唯一来源（前端不写 profiles），触发器必须建成功。
create or replace function public.tg_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end
$$;

-- search_norm 自动维护（用普通列 + 触发器，而不是生成列：
-- 生成列要求表达式严格 IMMUTABLE，跨版本行为不一致，触发器更稳）
create or replace function public.tg_templates_search_norm()
returns trigger
language plpgsql
as $$
begin
  new.search_norm := public.norm_text(
    coalesce(new.title, '') || ' ' ||
    coalesce(new.summary, '') || ' ' ||
    coalesce(new.source_name, '') || ' ' ||
    coalesce(new.source_author, '')
  );
  return new;
end
$$;

-- 收藏数维护：favorites 增删时同步 templates.favorite_count
create or replace function public.tg_favorites_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.templates set favorite_count = favorite_count + 1 where id = new.template_id;
  elsif tg_op = 'DELETE' then
    update public.templates set favorite_count = greatest(favorite_count - 1, 0) where id = old.template_id;
  end if;
  return null;
end
$$;

--------------------------------------------------------------------------------
-- 3. 触发器
--------------------------------------------------------------------------------
drop trigger if exists trg_auth_user_created on auth.users;
create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_handle_new_user();

drop trigger if exists trg_templates_search_norm on public.templates;
create trigger trg_templates_search_norm
  before insert or update of title, summary, source_name, source_author
  on public.templates
  for each row execute function public.tg_templates_search_norm();

drop trigger if exists trg_templates_updated_at on public.templates;
create trigger trg_templates_updated_at
  before update on public.templates
  for each row execute function public.tg_set_updated_at();

drop trigger if exists trg_submissions_updated_at on public.submissions;
create trigger trg_submissions_updated_at
  before update on public.submissions
  for each row execute function public.tg_set_updated_at();

drop trigger if exists trg_favorites_count on public.favorites;
create trigger trg_favorites_count
  after insert or delete on public.favorites
  for each row execute function public.tg_favorites_count();

--------------------------------------------------------------------------------
-- 4. 索引
--------------------------------------------------------------------------------
create index if not exists idx_templates_search_norm on public.templates using gin (search_norm gin_trgm_ops);
create index if not exists idx_templates_category    on public.templates (category_id);
create index if not exists idx_templates_status_pub  on public.templates (status, published_at desc);
create index if not exists idx_templates_downloads   on public.templates (download_count desc);
create index if not exists idx_templates_favorites   on public.templates (favorite_count desc);
create index if not exists idx_templates_formats     on public.templates using gin (file_formats);
create index if not exists idx_templates_languages   on public.templates using gin (languages);
create index if not exists idx_templates_featured    on public.templates (featured) where featured;
create index if not exists idx_template_tags_tag      on public.template_tags (tag_id);
create index if not exists idx_favorites_template     on public.favorites (template_id);
create index if not exists idx_submissions_status     on public.submissions (status, created_at desc);
create index if not exists idx_submissions_user       on public.submissions (submitted_by, created_at desc);
create index if not exists idx_link_reports_template  on public.link_reports (template_id);

--------------------------------------------------------------------------------
-- 5. 自检：跑完应看到 9 张表
--------------------------------------------------------------------------------
do $$
declare
  n int;
begin
  select count(*) into n
  from pg_tables
  where schemaname = 'public'
    and tablename in ('profiles','categories','tags','templates','template_tags',
                      'favorites','submissions','contact_messages','link_reports');
  raise notice '01-schema.sql 完成：public schema 下已有 % / 9 张表', n;
  if n <> 9 then
    raise warning '表数量不是 9，请检查上方是否有语句被跳过';
  end if;
end
$$;
