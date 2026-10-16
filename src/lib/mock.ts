/**
 * 演示模式数据源。
 *
 * 未配置 Supabase 环境变量时，站点用 src/data/seed.json 里的同一份种子数据渲染全流程，
 * 这样在拿到云端凭据之前也能完整体验：搜索、筛选、预览、外链、页面结构都是真的。
 * 填上 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 后自动切换到真实云端数据。
 */
import seed from '@/data/seed.json'
import type { Category, Tag, Template } from '@/lib/types'

interface SeedTemplate {
  slug: string
  title: string
  summary: string
  cat: string
  layout: string
  audience: string
  tone: string
  photo: boolean
  ats: boolean
  lang: string[]
  fmt: string[]
  pages: number
  lic: string
  source: string
  author?: string
  url: string
  dl: string
  featured: boolean
  tags: string[]
}

interface SeedData {
  categories: { slug: string; name: string; short_desc: string; color_hex: string; icon: string; sort_order: number }[]
  tags: { slug: string; name: string; kind: string }[]
  templates: SeedTemplate[]
}

const data = seed as unknown as SeedData

/** 稳定伪 uuid：同一 slug 每次运行得到同一个 id，保证 React key 与收藏映射稳定 */
function stableId(input: string): string {
  let a = 0x811c9dc5
  let b = 0x01000193
  for (let i = 0; i < input.length; i++) {
    a = Math.imul(a ^ input.charCodeAt(i), 16777619) >>> 0
    b = Math.imul(b + input.charCodeAt(i) * (i + 7), 2246822519) >>> 0
  }
  const hex = (n: number) => n.toString(16).padStart(8, '0')
  return `${hex(a)}-${hex(b).slice(0, 4)}-4${hex(a).slice(1, 4)}-a${hex(b).slice(5, 8)}-${hex(a)}${hex(b).slice(0, 4)}`
}

function pseudo(seedStr: string, mod: number): number {
  let h = 2166136261
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) % mod
}

export const MOCK_CATEGORIES: Category[] = data.categories.map((c) => ({
  id: stableId(`cat:${c.slug}`),
  slug: c.slug,
  name: c.name,
  short_desc: c.short_desc,
  color_hex: c.color_hex,
  icon: c.icon,
  sort_order: c.sort_order,
}))

export const MOCK_TAGS: Tag[] = data.tags.map((t) => ({
  id: stableId(`tag:${t.slug}`),
  slug: t.slug,
  name: t.name,
  kind: t.kind as Tag['kind'],
}))

const categoryBySlug = new Map(MOCK_CATEGORIES.map((c) => [c.slug, c]))
const tagBySlug = new Map(MOCK_TAGS.map((t) => [t.slug, t]))

function toTemplate(raw: SeedTemplate, index: number): Template {
  const cat = categoryBySlug.get(raw.cat) ?? MOCK_CATEGORIES[0]
  const daysAgo = 1 + pseudo(raw.slug + 'p', 200)
  const downloads = 60 + pseudo(raw.slug + 'd', 940)
  const published = Date.now() - daysAgo * 86400000
  const iso = new Date(published).toISOString()

  return {
    id: stableId(`tpl:${raw.slug}`),
    slug: raw.slug,
    title: raw.title,
    summary: raw.summary,
    description: null,
    category_id: cat.id,
    layout: raw.layout as Template['layout'],
    audience: raw.audience as Template['audience'],
    color_tone: raw.tone as Template['color_tone'],
    accent_hex: cat.color_hex,
    has_photo_slot: raw.photo,
    ats_friendly: raw.ats,
    languages: raw.lang as Template['languages'],
    file_formats: raw.fmt as Template['file_formats'],
    page_count: raw.pages,
    license_type: raw.lic as Template['license_type'],
    license_note: null,
    source_name: raw.source,
    source_author: raw.author ?? null,
    source_url: raw.url,
    download_url: raw.dl,
    preview_url: null,
    preview_storage_path: null,
    preview_kind: 'generated',
    preview_width: null,
    preview_height: null,
    status: 'published',
    featured: raw.featured,
    submitted_by: null,
    view_count: downloads * (3 + pseudo(raw.slug + 'v', 6)),
    download_count: downloads,
    favorite_count: Math.round(downloads * (0.08 + pseudo(raw.slug + 'f', 20) / 100)),
    broken_report_count: 0,
    link_status: 'unknown',
    link_checked_at: null,
    created_at: iso,
    updated_at: iso,
    published_at: iso,
    category: { id: cat.id, slug: cat.slug, name: cat.name, color_hex: cat.color_hex },
    tags: raw.tags
      .map((s) => tagBySlug.get(s))
      .filter((t): t is Tag => Boolean(t))
      .map((t) => ({ id: t.id, slug: t.slug, name: t.name })),
    is_favorited: false,
  }
}

export const MOCK_TEMPLATES: Template[] = data.templates.map(toTemplate)

/** 演示模式下的本地收藏与浏览记录（刷新即丢失，仅用于体验交互） */
export const demoState = {
  favorites: new Set<string>(),
  views: new Set<string>(),
}
