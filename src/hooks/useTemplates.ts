import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query'
import { getTemplateBySlug, listCategories, searchTemplates, type SearchOptions } from '@/api/templates'
import type { Category, SearchResult, Template, TemplateFilters } from '@/lib/types'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

/** 搜索结果。关键词做了防抖，避免每敲一个字就打一次数据库。 */
export function useTemplates(filters: TemplateFilters, opts: SearchOptions = {}): UseQueryResult<SearchResult> {
  const debouncedQ = useDebouncedValue(filters.q, 300)
  const debouncedFilters: TemplateFilters = { ...filters, q: debouncedQ }

  return useQuery({
    queryKey: ['templates', debouncedFilters, opts],
    queryFn: () => searchTemplates(debouncedFilters, opts),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function useCategories(): UseQueryResult<Category[]> {
  return useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
    staleTime: 10 * 60_000,
  })
}

export function useTemplateDetail(slug: string | undefined): UseQueryResult<Template | null> {
  return useQuery({
    queryKey: ['template', slug],
    queryFn: () => getTemplateBySlug(slug as string),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}
