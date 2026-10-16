import { MOCK_CATEGORIES, MOCK_TEMPLATES, demoState } from '@/lib/mock'
import { isDemoMode, supabase } from '@/lib/supabase'
import type { Category, SearchResult, Stats, Template, TemplateFilters } from '@/lib/types'

export const PER_PAGE = 12

/* ------------------------------------------------------------------ 映射 */

/**
 * search_templates 返回的行。字段是运行时从 Postgres 拿到的，
 * 只有 slug / title 是各处都保证存在的，其余按可选读取。
 */
type RpcRow = Record<string, unknown> & {
  slug?: string
  title?: string
  total_count?: number | string
}

function mapRpcRow(row: RpcRow): Template {
  return {
    id: row.id as string,
    slug: row.slug ?? '',
    title: row.title ?? '',
    summary: (row.summary as string) ?? null,
    description: null,
    category_id: row.category_id as string,
    layout: row.layout as Template['layout'],
    audience: row.audience as Template['audience'],
    color_tone: row.color_tone as Template['color_tone'],
    accent_hex: (row.accent_hex as string) ?? null,
    has_photo_slot: Boolean(row.has_photo_slot),
    ats_friendly: Boolean(row.ats_friendly),
    languages: (row.languages as string[]) ?? [],
    file_formats: (row.file_formats as string[]) ?? [],
    page_count: (row.page_count as number) ?? null,
    license_type: row.license_type as Template['license_type'],
    license_note: null,
    source_name: row.source_name as string,
    source_author: (row.source_author as string) ?? null,
    source_url: row.source_url as string,
    download_url: row.download_url as string,
    preview_url: (row.preview_url as string) ?? null,
    preview_storage_path: (row.preview_storage_path as string) ?? null,
    preview_kind: (row.preview_kind as Template['preview_kind']) ?? 'generated',
    preview_width: null,
    preview_height: null,
    status: 'published',
    featured: Boolean(row.featured),
    submitted_by: null,
    view_count: Number(row.view_count ?? 0),
    download_count: Number(row.download_count ?? 0),
    favorite_count: Number(row.favorite_count ?? 0),
    broken_report_count: Number(row.broken_report_count ?? 0),
    link_status: (row.link_status as Template['link_status']) ?? 'unknown',
    link_checked_at: null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    published_at: row.published_at as string,
    category: {
      id: row.category_id as string,
      slug: row.category_slug as string,
      name: row.category_name as string,
      color_hex: row.category_color as string,
    },
    tags: [],
    is_favorited: Boolean(row.is_favorited),
  }
}

/* ------------------------------------------------------- 演示模式本地筛选 */

function demoMatches(t: Template, f: TemplateFilters): boolean {
  const q = f.q.trim().toLowerCase()
  if (q) {
    const hay = [t.title, t.summary ?? '', t.source_name, t.source_author ?? '', t.category?.name ?? '']
      .join(' ')
      .toLowerCase()
    if (!hay.includes(q)) return false
  }
  if (f.cat.length && (!t.category || !f.cat.includes(t.category.slug))) return false
  if (f.fmt.length && !t.file_formats.some((x) => f.fmt.includes(x))) return false
  if (f.layout.length && !f.layout.includes(t.layout)) return false
  if (f.audience.length && !f.audience.includes(t.audience)) return false
  if (f.tone.length && !f.tone.includes(t.color_tone)) return false
  if (f.lang.length && !t.languages.some((x) => f.lang.includes(x))) return false
  if (f.license.length && !f.license.includes(t.license_type)) return false
  if (f.ats && !t.ats_friendly) return false
  if (f.photo && !t.has_photo_slot) return false
  return true
}

function demoSearch(f: TemplateFilters, perPage: number): SearchResult {
  const q = f.q.trim().toLowerCase()
  let list = MOCK_TEMPLATES.filter((t) => demoMatches(t, f))

  list = [...list].sort((a, b) => {
    if (f.sort === 'newest') return b.published_at.localeCompare(a.published_at)
    if (f.sort === 'hot') return b.download_count - a.download_count
    if (f.sort === 'favorited') return b.favorite_count - a.favorite_count
    // relevance：有关键词时按标题命中优先，其次精选，最后时间
    if (q) {
      const ah = a.title.toLowerCase().includes(q) ? 1 : 0
      const bh = b.title.toLowerCase().includes(q) ? 1 : 0
      if (ah !== bh) return bh - ah
    }
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return b.published_at.localeCompare(a.published_at)
  })

  const total = list.length
  const start = (f.page - 1) * perPage
  const items = list.slice(start, start + perPage).map((t) => ({
    ...t,
    is_favorited: demoState.favorites.has(t.id),
  }))
  return { items, total, page: f.page, perPage }
}

/* ------------------------------------------------------------------ 查询 */

export interface SearchOptions {
  featuredOnly?: boolean
  perPage?: number
}

export async function searchTemplates(filters: TemplateFilters, opts: SearchOptions = {}): Promise<SearchResult> {
  const perPage = opts.perPage ?? PER_PAGE

  if (isDemoMode) return demoSearch(filters, perPage)

  const emptyToNull = (arr: string[]) => (arr.length ? arr : null)

  const { data, error } = await supabase!.rpc('search_templates', {
    p_q: filters.q.trim() || null,
    p_cat: emptyToNull(filters.cat),
    p_fmt: emptyToNull(filters.fmt),
    p_layout: emptyToNull(filters.layout),
    p_audience: emptyToNull(filters.audience),
    p_tone: emptyToNull(filters.tone),
    p_lang: emptyToNull(filters.lang),
    p_license: emptyToNull(filters.license),
    p_ats: filters.ats,
    p_photo: filters.photo,
    p_featured: opts.featuredOnly ?? false,
    p_sort: filters.q.trim() ? filters.sort : filters.sort === 'relevance' ? 'newest' : filters.sort,
    p_page: filters.page,
    p_per_page: perPage,
  })

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as RpcRow[]
  return {
    items: rows.map(mapRpcRow),
    total: Number(rows[0]?.total_count ?? 0),
    page: filters.page,
    perPage,
  }
}

/** 首页需要的几组列表，合并成一次请求批次以省往返 */
export async function fetchHomeLists(): Promise<{
  featured: Template[]
  latest: Template[]
  categories: Category[]
  stats: Stats
}> {
  const [featuredRes, latestRes, categories, stats] = await Promise.all([
    searchTemplates({ ...EMPTY_FILTERS, sort: 'relevance', page: 1 }, { featuredOnly: true, perPage: 8 }),
    searchTemplates({ ...EMPTY_FILTERS, sort: 'newest', page: 1 }, { perPage: 8 }),
    listCategories(),
    getStats(),
  ])
  return { featured: featuredRes.items, latest: latestRes.items, categories, stats }
}

const EMPTY_FILTERS: TemplateFilters = {
  q: '',
  cat: [],
  fmt: [],
  layout: [],
  audience: [],
  tone: [],
  lang: [],
  license: [],
  ats: false,
  photo: false,
  sort: 'relevance',
  page: 1,
  view: 'grid',
}

export async function getTemplateBySlug(slug: string): Promise<Template | null> {
  if (isDemoMode) {
    const found = MOCK_TEMPLATES.find((t) => t.slug === slug)
    return found ? { ...found, is_favorited: demoState.favorites.has(found.id) } : null
  }

  const { data, error } = await supabase!
    .from('templates')
    .select(
      '*, category:categories(id,slug,name,color_hex), tt:template_tags(tag:tags(id,slug,name))',
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  const row = data as unknown as Record<string, unknown>
  const t = mapRpcRow({
    ...row,
    category_slug: (row.category as { slug?: string } | null)?.slug ?? null,
    category_name: (row.category as { name?: string } | null)?.name ?? null,
    category_color: (row.category as { color_hex?: string } | null)?.color_hex ?? null,
    is_favorited: false,
  })

  const tt = (row.tt ?? []) as { tag?: { id: string; slug: string; name: string } | null }[]
  t.tags = tt.map((x) => x.tag).filter((x): x is { id: string; slug: string; name: string } => Boolean(x))
  t.description = (row.description as string) ?? null
  t.license_note = (row.license_note as string) ?? null
  t.preview_width = (row.preview_width as number) ?? null
  t.preview_height = (row.preview_height as number) ?? null

  return t
}

export async function listCategories(): Promise<Category[]> {
  if (isDemoMode) return [...MOCK_CATEGORIES].sort((a, b) => a.sort_order - b.sort_order)

  const { data, error } = await supabase!.from('categories').select('*').order('sort_order')
  if (error) throw new Error(error.message)
  return (data ?? []) as Category[]
}

export async function getStats(): Promise<Stats> {
  if (isDemoMode) {
    return {
      templates: MOCK_TEMPLATES.length,
      categories: MOCK_CATEGORIES.length,
      sources: new Set(MOCK_TEMPLATES.map((t) => t.source_name)).size,
    }
  }
  const { data, error } = await supabase!.rpc('site_stats')
  if (error) throw new Error(error.message)
  const row = (data as { templates?: number; categories?: number; sources?: number }[])?.[0]
  return {
    templates: Number(row?.templates ?? 0),
    categories: Number(row?.categories ?? 0),
    sources: Number(row?.sources ?? 0),
  }
}

/* ------------------------------------------------------------------ 动作 */

export async function recordView(slug: string): Promise<void> {
  if (isDemoMode) {
    demoState.views.add(slug)
    return
  }
  await supabase!.rpc('increment_view', { p_slug: slug })
}

export async function recordDownload(slug: string): Promise<void> {
  if (isDemoMode) return
  await supabase!.rpc('increment_download', { p_slug: slug })
}

export async function reportBrokenLink(slug: string, reason: string, detail?: string): Promise<void> {
  if (isDemoMode) return
  const { error } = await supabase!.rpc('report_link', { p_slug: slug, p_reason: reason, p_detail: detail ?? null })
  if (error) throw new Error(error.message)
}
