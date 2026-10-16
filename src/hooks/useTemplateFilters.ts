import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { SortKey, TemplateFilters, ViewMode } from '@/lib/types'

/**
 * 筛选状态 ⇄ URL query 双向绑定。
 * 所有筛选条件都写在地址栏里：可分享、可后退、刷新不丢状态。
 *   ?q=简历&cat=tech,design&fmt=pdf&sort=hot&page=2&view=list
 */

export const DEFAULT_FILTERS: TemplateFilters = {
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

const MULTI_KEYS = ['cat', 'fmt', 'layout', 'audience', 'tone', 'lang', 'license'] as const
type MultiKey = (typeof MULTI_KEYS)[number]

const SORT_KEYS: SortKey[] = ['relevance', 'newest', 'hot', 'favorited']

function parseList(raw: string | null): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function parseFilters(params: URLSearchParams): TemplateFilters {
  const sortRaw = params.get('sort') as SortKey | null
  const viewRaw = params.get('view')
  const pageRaw = Number.parseInt(params.get('page') ?? '1', 10)

  return {
    q: params.get('q') ?? '',
    cat: parseList(params.get('cat')),
    fmt: parseList(params.get('fmt')),
    layout: parseList(params.get('layout')),
    audience: parseList(params.get('audience')),
    tone: parseList(params.get('tone')),
    lang: parseList(params.get('lang')),
    license: parseList(params.get('license')),
    ats: params.get('ats') === '1',
    photo: params.get('photo') === '1',
    sort: sortRaw && SORT_KEYS.includes(sortRaw) ? sortRaw : 'relevance',
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
    view: viewRaw === 'list' ? 'list' : 'grid',
  }
}

export interface UseTemplateFiltersResult {
  filters: TemplateFilters
  /** 局部更新任意字段；改筛选条件会自动回到第 1 页 */
  update: (patch: Partial<TemplateFilters>, opts?: { keepPage?: boolean }) => void
  setQuery: (q: string) => void
  setPage: (page: number) => void
  /** 多选维度里加/删一个值 */
  toggle: (key: MultiKey, value: string) => void
  clearGroup: (key: MultiKey) => void
  clearAll: () => void
  activeCount: number
}

export function useTemplateFilters(): UseTemplateFiltersResult {
  const [params, setParams] = useSearchParams()

  const filters = useMemo(() => parseFilters(params), [params])

  const write = useCallback(
    (next: TemplateFilters) => {
      const p = new URLSearchParams()
      if (next.q.trim()) p.set('q', next.q.trim())
      for (const key of MULTI_KEYS) {
        if (next[key].length) p.set(key, next[key].join(','))
      }
      if (next.ats) p.set('ats', '1')
      if (next.photo) p.set('photo', '1')
      if (next.sort !== 'relevance') p.set('sort', next.sort)
      if (next.page > 1) p.set('page', String(next.page))
      if (next.view !== 'grid') p.set('view', next.view)
      setParams(p, { replace: true })
    },
    [setParams],
  )

  const update = useCallback(
    (patch: Partial<TemplateFilters>, opts?: { keepPage?: boolean }) => {
      const next: TemplateFilters = { ...filters, ...patch }
      // 除了单纯翻页，任何条件变化都回到第 1 页
      const isOnlyPageChange = Object.keys(patch).length === 1 && 'page' in patch
      if (!opts?.keepPage && !isOnlyPageChange) next.page = 1
      write(next)
    },
    [filters, write],
  )

  const setQuery = useCallback((q: string) => update({ q }), [update])
  const setPage = useCallback((page: number) => update({ page }, { keepPage: true }), [update])

  const toggle = useCallback(
    (key: MultiKey, value: string) => {
      const current = filters[key]
      const nextValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      update({ [key]: nextValues } as Partial<TemplateFilters>)
    },
    [filters, update],
  )

  const clearGroup = useCallback(
    (key: MultiKey) => update({ [key]: [] } as Partial<TemplateFilters>),
    [update],
  )

  const clearAll = useCallback(
    () => write({ ...DEFAULT_FILTERS, sort: filters.sort, view: filters.view }),
    [filters.sort, filters.view, write],
  )

  const activeCount = useMemo(() => {
    let n = 0
    for (const key of MULTI_KEYS) n += filters[key].length
    if (filters.q.trim()) n += 1
    if (filters.ats) n += 1
    if (filters.photo) n += 1
    return n
  }, [filters])

  return { filters, update, setQuery, setPage, toggle, clearGroup, clearAll, activeCount }
}

export { MULTI_KEYS, type MultiKey }
export type { ViewMode }
