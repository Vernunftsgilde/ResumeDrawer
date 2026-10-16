import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SearchX } from 'lucide-react'
import { useState } from 'react'
import { searchTemplates } from '@/api/templates'
import { Pagination } from '@/components/common/pagination'
import { EmptyState, ErrorState } from '@/components/common/states'
import { FilterPanel } from '@/components/search/FilterPanel'
import { SearchBar } from '@/components/search/SearchBar'
import {
  ActiveFilterChips,
  MobileFilterButton,
  SortSelect,
  ViewToggle,
} from '@/components/search/ResultsToolbar'
import { TemplateCard } from '@/components/template/TemplateCard'
import { TemplateRow } from '@/components/template/TemplateRow'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { GridSkeleton } from '@/components/ui/skeleton'
import { useTemplateFilters } from '@/hooks/useTemplateFilters'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useCategories } from '@/hooks/useTemplates'
import { categoryLabel } from '@/lib/facets'
import { useSEO } from '@/lib/seo'

export function TemplatesPage() {
  const { filters, update, setQuery, setPage, toggle, clearGroup, clearAll, activeCount } = useTemplateFilters()
  const [filterOpen, setFilterOpen] = useState(false)
  const { data: categories = [] } = useCategories()

  const debouncedQ = useDebouncedValue(filters.q, 300)
  const effectiveFilters = { ...filters, q: debouncedQ }

  const query = useQuery({
    queryKey: ['templates', effectiveFilters, {}],
    queryFn: () => searchTemplates(effectiveFilters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

  const heading = filters.cat.length === 1 ? `${categoryLabel(filters.cat[0])}简历模板` : '模板库'
  useSEO({
    title: heading,
    description: `按版式、文件格式、适用人群与色调筛选简历模板，共收录 ${query.data?.total ?? 0} 份公开来源模板，预览后跳转原作者页面下载。`,
    path: '/templates',
  })

  const total = query.data?.total ?? 0
  const items = query.data?.items ?? []

  return (
    <div className="rd-container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">{heading}</h1>
        <p className="mt-1.5 text-sm text-ink-500">
          {query.isLoading ? '正在检索…' : `共 ${total} 份模板`}
          {filters.q.trim() && <span className="ml-1">· 关键词「{filters.q.trim()}」</span>}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[232px_minmax(0,1fr)]">
        {/* 桌面端侧栏筛选 */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
            <FilterPanel filters={filters} toggle={toggle} clearGroup={clearGroup} update={update} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar
              value={filters.q}
              onChange={setQuery}
              autoFocusShortcut
              className="flex-1"
              placeholder="搜索模板名称、来源或关键词"
            />
            <div className="flex items-center gap-2">
              <MobileFilterButton count={activeCount} onClick={() => setFilterOpen(true)} />
              <ViewToggle value={filters.view} onChange={(v) => update({ view: v })} />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ActiveFilterChips
              filters={filters}
              toggle={toggle}
              clearAll={clearAll}
              update={update}
            />
            <SortSelect value={filters.sort} onChange={(v) => update({ sort: v })} />
          </div>

          <div className="mt-5">
            {query.isError ? (
              <ErrorState onRetry={() => void query.refetch()} />
            ) : query.isLoading ? (
              filters.view === 'grid' ? (
                <GridSkeleton count={9} />
              ) : (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-28 animate-pulse rounded-card bg-ink-200/70" />
                  ))}
                </div>
              )
            ) : items.length === 0 ? (
              <EmptyState
                icon={<SearchX className="size-9" />}
                title="没有符合条件的模板"
                description="试着减少几个筛选条件，或者换个关键词。也可以直接浏览全部模板。"
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="secondary" size="sm" onClick={clearAll}>
                      清空全部筛选
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => update({ cat: categories.map((c) => c.slug) })}
                    >
                      改成全部分类
                    </Button>
                  </div>
                }
              />
            ) : filters.view === 'grid' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((t, i) => (
                  <TemplateCard key={t.id} template={t} eager={i < 3} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((t) => (
                  <TemplateRow key={t.id} template={t} />
                ))}
              </div>
            )}
          </div>

          {!query.isLoading && items.length > 0 && (
            <Pagination
              page={filters.page}
              perPage={query.data?.perPage ?? 12}
              total={total}
              onChange={setPage}
            />
          )}
        </div>
      </div>

      {/* 移动端筛选抽屉 */}
      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="筛选"
        className="sm:max-w-lg"
        footer={
          <Button variant="primary" onClick={() => setFilterOpen(false)}>
            查看结果
          </Button>
        }
      >
        <div className="-mx-1 max-h-[60vh] overflow-y-auto">
          <FilterPanel filters={filters} toggle={toggle} clearGroup={clearGroup} update={update} />
        </div>
      </Dialog>
    </div>
  )
}
