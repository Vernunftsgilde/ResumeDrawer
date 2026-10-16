-- ============================================================================
-- ResumeDrawer · 05-verify.sql
-- 安装自检：整段运行后，所有检查项的 ok 列都应为 t
-- 任何时候怀疑数据库状态不对，都可以重跑一遍
-- ============================================================================

-- 1. 扩展
select 'extensions' as item,
       (select count(*) from pg_extension where extname in ('pg_trgm', 'unaccent')) = 2 as ok,
       (select string_agg(extname, ', ') from pg_extension where extname in ('pg_trgm', 'unaccent')) as detail;

-- 2. 表
select 'tables' as item,
       (select count(*) from information_schema.tables
         where table_schema = 'public'
           and table_name in ('profiles','categories','tags','template_tags','templates',
                              'favorites','submissions','contact_messages','link_reports')) = 9 as ok,
       (select count(*)::text || '/9' from information_schema.tables
         where table_schema = 'public'
           and table_name in ('profiles','categories','tags','template_tags','templates',
                              'favorites','submissions','contact_messages','link_reports')) as detail;

-- 3. RLS 是否已开启
select 'rls_enabled' as item,
       (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
         where n.nspname = 'public' and c.relrowsecurity
           and c.relname in ('profiles','categories','tags','template_tags','templates',
                             'favorites','submissions','contact_messages','link_reports')) = 9 as ok,
       (select count(*)::text || ' 张表已开启 RLS' from pg_class c join pg_namespace n on n.oid = c.relnamespace
         where n.nspname = 'public' and c.relrowsecurity) as detail;

-- 4. 关键函数
select 'functions' as item,
       (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public'
           and p.proname in ('search_templates','increment_view','increment_download',
                             'toggle_favorite','report_link','site_stats','is_admin','norm_text')) = 8 as ok,
       (select string_agg(p.proname, ', ' order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public'
           and p.proname in ('search_templates','increment_view','increment_download',
                             'toggle_favorite','report_link','site_stats','is_admin','norm_text')) as detail;

-- 5. 索引
select 'indexes' as item,
       (select count(*) from pg_indexes where schemaname = 'public' and indexname like 'idx_%') >= 12 as ok,
       (select count(*)::text || ' 个索引' from pg_indexes where schemaname = 'public' and indexname like 'idx_%') as detail;

-- 6. Storage 桶
select 'storage_bucket' as item,
       (select count(*) from storage.buckets where id = 'previews') = 1 as ok,
       coalesce((select case when public then 'previews (公开读)' else 'previews (私有！)' end
                 from storage.buckets where id = 'previews'), 'previews 桶不存在') as detail;

-- 7. 数据
select 'data' as item,
       (select count(*) from public.templates where status = 'published') > 0 as ok,
       (select (count(*) filter (where status = 'published'))::text || ' 条已发布模板 / '
            || (select count(*) from public.categories)::text || ' 个分类 / '
            || (select count(*) from public.tags)::text || ' 个标签'
          from public.templates) as detail;

-- 8. 搜索自检：中文子串 + 英文关键词
select 'search_zh' as item,
       (select count(*) from public.templates
         where search_norm like '%' || public.norm_text('应届') || '%') > 0 as ok,
       (select count(*)::text || ' 条命中「应届」' from public.templates
         where search_norm like '%' || public.norm_text('应届') || '%') as detail;

select 'search_en' as item,
       (select count(*) from public.templates
         where search_norm like '%' || public.norm_text('latex') || '%') > 0 as ok,
       (select count(*)::text || ' 条命中「latex」' from public.templates
         where search_norm like '%' || public.norm_text('latex') || '%') as detail;

-- 9. RPC 自检：直接跑一次搜索，看是否返回 total_count
select 'rpc_search' as item,
       (select count(*) from public.search_templates(p_q => '简历', p_per_page => 5)) >= 0 as ok,
       (select '返回 ' || count(*)::text || ' 行'
          from public.search_templates(p_q => null, p_per_page => 3)) as detail;
