-- ============================================================================
-- ResumeDrawer · 03-rpc.sql
-- 搜索 / 计数 / 收藏 / 外链上报 / 站点统计
-- 在 SQL Editor 整段粘贴运行；幂等
--
-- 说明：搜索与分页全部放在数据库里做（数据量几十到几千条，前端过滤不合适）。
--       search_templates 用 security invoker，因此 RLS 照常生效（anon 只能读 published）。
-- ============================================================================

--------------------------------------------------------------------------------
-- 1. 搜索（含筛选、排序、分页）
--------------------------------------------------------------------------------
create or replace function public.search_templates(
  p_q          text    default null,
  p_cat        text[]  default null,
  p_fmt        text[]  default null,
  p_layout     text[]  default null,
  p_audience   text[]  default null,
  p_tone       text[]  default null,
  p_lang       text[]  default null,
  p_license    text[]  default null,
  p_ats        boolean default false,
  p_photo      boolean default false,
  p_featured   boolean default false,
  p_sort       text    default 'relevance',
  p_page       int     default 1,
  p_per_page   int     default 12
)
returns table (
  id uuid, slug text, title text, summary text, category_id uuid,
  layout text, audience text, color_tone text, accent_hex text,
  has_photo_slot boolean, ats_friendly boolean, languages text[], file_formats text[],
  page_count smallint, license_type text,
  source_name text, source_author text, source_url text, download_url text,
  preview_url text, preview_storage_path text, preview_kind text,
  featured boolean,
  view_count bigint, download_count bigint, favorite_count bigint,
  broken_report_count int, link_status text,
  created_at timestamptz, updated_at timestamptz, published_at timestamptz,
  category_slug text, category_name text, category_color text,
  is_favorited boolean, total_count bigint
)
language sql
stable
set search_path = public, extensions
as $$
  with params as (
    select
      public.norm_text(p_q)                        as nq,
      greatest(coalesce(p_per_page, 12), 1)        as per_page,
      greatest(coalesce(p_page, 1), 1)             as page_no
  ),
  filtered as (
    select
      t.*,
      c.slug      as cat_slug,
      c.name      as cat_name,
      c.color_hex as cat_color,
      exists (
        select 1 from public.favorites fv
        where fv.template_id = t.id and fv.user_id = auth.uid()
      ) as fav
    from public.templates t
    join public.categories c on c.id = t.category_id
    cross join params pm
    where t.status = 'published'
      and (pm.nq = '' or t.search_norm like '%' || pm.nq || '%')
      and (p_cat      is null or c.slug          = any(p_cat))
      and (p_fmt      is null or t.file_formats && p_fmt)
      and (p_layout   is null or t.layout        = any(p_layout))
      and (p_audience is null or t.audience      = any(p_audience))
      and (p_tone     is null or t.color_tone    = any(p_tone))
      and (p_lang     is null or t.languages    && p_lang)
      and (p_license  is null or t.license_type  = any(p_license))
      and (not coalesce(p_ats, false)      or t.ats_friendly)
      and (not coalesce(p_photo, false)    or t.has_photo_slot)
      and (not coalesce(p_featured, false) or t.featured)
  )
  select
    f.id, f.slug, f.title, f.summary, f.category_id,
    f.layout, f.audience, f.color_tone, f.accent_hex,
    f.has_photo_slot, f.ats_friendly, f.languages, f.file_formats,
    f.page_count, f.license_type,
    f.source_name, f.source_author, f.source_url, f.download_url,
    f.preview_url, f.preview_storage_path, f.preview_kind,
    f.featured,
    f.view_count, f.download_count, f.favorite_count,
    f.broken_report_count, f.link_status,
    f.created_at, f.updated_at, f.published_at,
    f.cat_slug, f.cat_name, f.cat_color,
    f.fav,
    count(*) over()
  from filtered f
  order by
    case when p_sort = 'newest'    then f.published_at    end desc nulls last,
    case when p_sort = 'hot'       then f.download_count  end desc nulls last,
    case when p_sort = 'favorited' then f.favorite_count  end desc nulls last,
    case when p_sort = 'relevance' then f.featured        end desc nulls last,
    case when p_sort = 'relevance' and coalesce(p_q, '') <> ''
         then similarity(f.search_norm, (select nq from params)) end desc nulls last,
    f.published_at desc
  limit (select per_page from params)
  offset ((select page_no from params) - 1) * (select per_page from params);
$$;

--------------------------------------------------------------------------------
-- 2. 计数（原子自增，避免并发下读改写丢更新）
--------------------------------------------------------------------------------
create or replace function public.increment_view(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.templates
     set view_count = view_count + 1
   where slug = p_slug and status = 'published';
$$;

create or replace function public.increment_download(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.templates
     set download_count = download_count + 1
   where slug = p_slug and status = 'published';
$$;

--------------------------------------------------------------------------------
-- 3. 收藏开关：返回切换后的状态（true = 已收藏）
--------------------------------------------------------------------------------
create or replace function public.toggle_favorite(p_template_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exists boolean;
begin
  if auth.uid() is null then
    raise exception '请先登录';
  end if;

  select exists (
    select 1 from public.favorites
     where user_id = auth.uid() and template_id = p_template_id
  ) into v_exists;

  if v_exists then
    delete from public.favorites
     where user_id = auth.uid() and template_id = p_template_id;
    return false;
  else
    insert into public.favorites (user_id, template_id)
    values (auth.uid(), p_template_id);
    return true;
  end if;
end
$$;

--------------------------------------------------------------------------------
-- 4. 外链失效上报（允许匿名）
--------------------------------------------------------------------------------
create or replace function public.report_link(
  p_slug   text,
  p_reason text default 'other',
  p_detail text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id from public.templates where slug = p_slug;
  if v_id is null then
    return;
  end if;

  insert into public.link_reports (template_id, reason, detail, reporter_id)
  values (v_id, p_reason, p_detail, auth.uid());

  update public.templates
     set broken_report_count = broken_report_count + 1,
         link_status = 'broken'
   where id = v_id;
end
$$;

--------------------------------------------------------------------------------
-- 5. 站点统计（首页用）
--------------------------------------------------------------------------------
create or replace function public.site_stats()
returns table (templates bigint, categories bigint, sources bigint)
language sql
stable
set search_path = public
as $$
  select
    (select count(*) from public.templates where status = 'published'),
    (select count(*) from public.categories),
    (select count(distinct source_name) from public.templates where status = 'published');
$$;

--------------------------------------------------------------------------------
-- 6. 授权：确保匿名与登录角色都能调用
--------------------------------------------------------------------------------
grant execute on function public.search_templates(text, text[], text[], text[], text[], text[], text[], text[], boolean, boolean, boolean, text, int, int) to anon, authenticated;
grant execute on function public.increment_view(text)        to anon, authenticated;
grant execute on function public.increment_download(text)    to anon, authenticated;
grant execute on function public.toggle_favorite(uuid)       to authenticated;
grant execute on function public.report_link(text, text, text) to anon, authenticated;
grant execute on function public.site_stats()                to anon, authenticated;
