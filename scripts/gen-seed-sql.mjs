/**
 * 由 src/data/seed.json 生成 supabase/04-seed.sql。
 *
 * 种子数据的唯一来源是 src/data/seed.json —— 前端演示模式读它，数据库种子也由它生成，
 * 避免两处维护同一份数据。
 *
 * 用法：node scripts/gen-seed-sql.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const data = JSON.parse(readFileSync(join(root, 'src/data/seed.json'), 'utf8'))

const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`)
const arr = (list) => `'{${(list ?? []).join(',')}}'`

/** 稳定伪随机，保证每次生成的计数一致 */
function pseudo(seed, mod) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) % mod
}

const out = []
out.push(`-- ============================================================================
-- ResumeDrawer · 04-seed.sql
-- 由 scripts/gen-seed-sql.mjs 从 src/data/seed.json 自动生成，请勿手工编辑
-- 生成时间：${new Date().toISOString()}
-- 收录 ${data.templates.length} 条模板 / ${data.categories.length} 个分类 / ${data.tags.length} 个标签
--
-- 说明：本站只做索引，不托管任何模板文件。download_url 指向来源页面（部分为来源的模板库入口）。
--       上线前建议跑一次 node scripts/check-links.mjs 校验外链可用性。
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 分类
-- ---------------------------------------------------------------------------
insert into public.categories (slug, name, short_desc, color_hex, icon, sort_order) values`)

out.push(
  data.categories
    .map(
      (c) =>
        `  (${q(c.slug)}, ${q(c.name)}, ${q(c.short_desc)}, ${q(c.color_hex)}, ${q(c.icon)}, ${c.sort_order})`,
    )
    .join(',\n'),
)

out.push(`on conflict (slug) do update set
  name = excluded.name,
  short_desc = excluded.short_desc,
  color_hex = excluded.color_hex,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- 标签
-- ---------------------------------------------------------------------------
insert into public.tags (slug, name, kind) values`)

out.push(
  data.tags.map((t) => `  (${q(t.slug)}, ${q(t.name)}, ${q(t.kind)})`).join(',\n'),
)

out.push(`on conflict (slug) do update set name = excluded.name, kind = excluded.kind;

-- ---------------------------------------------------------------------------
-- 模板（只存元信息 + 外链，不存任何模板文件）
-- ---------------------------------------------------------------------------`)

for (const [i, t] of data.templates.entries()) {
  const catId = `(select id from public.categories where slug = ${q(t.cat)})`
  const downloads = 60 + pseudo(t.slug + 'd', 940)
  const views = downloads * (3 + pseudo(t.slug + 'v', 6))
  const favorites = Math.round(downloads * (0.08 + pseudo(t.slug + 'f', 20) / 100))
  const daysAgo = 1 + pseudo(t.slug + 'p', 200)

  out.push(`insert into public.templates (
  slug, title, summary, category_id, layout, audience, color_tone,
  has_photo_slot, ats_friendly, languages, file_formats, page_count,
  license_type, source_name, source_author, source_url, download_url,
  preview_kind, status, featured,
  view_count, download_count, favorite_count, published_at
) values (
  ${q(t.slug)}, ${q(t.title)}, ${q(t.summary)}, ${catId}, ${q(t.layout)}, ${q(t.audience)}, ${q(t.tone)},
  ${t.photo ? 'true' : 'false'}, ${t.ats ? 'true' : 'false'}, ${arr(t.lang)}, ${arr(t.fmt)}, ${t.pages ?? 'null'},
  ${q(t.lic)}, ${q(t.source)}, ${q(t.author ?? null)}, ${q(t.url)}, ${q(t.dl)},
  'generated', 'published', ${t.featured ? 'true' : 'false'},
  ${views}, ${downloads}, ${favorites}, now() - make_interval(days => ${daysAgo})
)
on conflict (slug) do nothing;`)
}

out.push(`
-- ---------------------------------------------------------------------------
-- 模板 × 标签
-- ---------------------------------------------------------------------------`)

for (const t of data.templates) {
  if (!t.tags?.length) continue
  const inList = t.tags.map((s) => q(s)).join(', ')
  out.push(
    `insert into public.template_tags (template_id, tag_id)\nselect t.id, g.id from public.templates t, public.tags g\nwhere t.slug = ${q(t.slug)} and g.slug in (${inList})\non conflict do nothing;`,
  )
}

out.push(`
commit;

-- 校验
select
  (select count(*) from public.templates) as templates,
  (select count(*) from public.categories) as categories,
  (select count(*) from public.tags) as tags,
  (select count(*) from public.template_tags) as template_tags;
`)

writeFileSync(join(root, 'supabase/04-seed.sql'), out.join('\n') + '\n', 'utf8')
console.log(
  `已生成 supabase/04-seed.sql：${data.templates.length} 条模板 / ${data.categories.length} 个分类 / ${data.tags.length} 个标签`,
)
