import { LayoutGrid, List, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import {
  AUDIENCES,
  COLOR_TONES,
  FILE_FORMATS,
  LANGUAGES,
  LAYOUTS,
  LICENSES,
  categoryLabel,
} from '@/lib/facets'
import type { MultiKey } from '@/hooks/useTemplateFilters'
import type { SortKey, TemplateFilters } from '@/lib/types'
import { SORT_OPTIONS } from '@/lib/facets'

const GROUP_LABELS: Record<string, string> = {
  cat: '分类',
  fmt: '格式',
  layout: '版式',
  audience: '人群',
  tone: '色调',
  lang: '语言',
  license: '授权',
}

const DICTIONARIES: Record<string, { value: string; label: string }[]> = {
  fmt: FILE_FORMATS,
  layout: LAYOUTS,
  audience: AUDIENCES,
  tone: COLOR_TONES,
  lang: LANGUAGES,
  license: LICENSES,
}

function labelOf(group: string, value: string): string {
  if (group === 'cat') return categoryLabel(value)
  return DICTIONARIES[group]?.find((o) => o.value === value)?.label ?? value
}

export function ActiveFilterChips({
  filters,
  toggle,
  clearAll,
  update,
}: {
  filters: TemplateFilters
  toggle: (key: MultiKey, value: string) => void
  clearAll: () => void
  update: (patch: Partial<TemplateFilters>) => void
}) {
  const chips: { key: string; group?: MultiKey; value: string; text: string }[] = []

  if (filters.q.trim()) chips.push({ key: `q:${filters.q}`, value: filters.q, text: `“${filters.q.trim()}”` })

  const multiKeys: MultiKey[] = ['cat', 'fmt', 'layout', 'audience', 'tone', 'lang', 'license']
  for (const key of multiKeys) {
    for (const v of filters[key]) {
      chips.push({ key: `${key}:${v}`, group: key, value: v, text: `${GROUP_LABELS[key]}：${labelOf(key, v)}` })
    }
  }
  if (filters.ats) chips.push({ key: 'ats', value: '', text: '仅 ATS 友好' })
  if (filters.photo) chips.push({ key: 'photo', value: '', text: '含照片位' })

  if (!chips.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => {
            if (c.key === 'q:' + filters.q) update({ q: '' })
            else if (c.key === 'ats') update({ ats: false })
            else if (c.key === 'photo') update({ photo: false })
            else if (c.group) toggle(c.group, c.value)
          }}
          className="group inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 py-1 pl-3 pr-2 text-[13px] text-brand-800 transition-colors hover:border-brand-300 hover:bg-brand-100"
        >
          {c.text}
          <X className="size-3.5 opacity-60 transition-opacity group-hover:opacity-100" />
        </button>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[13px] text-ink-500 underline-offset-2 transition-colors hover:text-ink-800 hover:underline"
      >
        <RotateCcw className="size-3.5" />
        清空全部
      </button>
    </div>
  )
}

export function SortSelect({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-ink-500">
      <span className="shrink-0">排序</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="h-9 cursor-pointer rounded-lg border border-ink-200 bg-white pl-2.5 pr-7 text-[13px] text-ink-800 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function ViewToggle({
  value,
  onChange,
}: {
  value: 'grid' | 'list'
  onChange: (v: 'grid' | 'list') => void
}) {
  return (
    <div className="flex items-center rounded-lg border border-ink-200 bg-white p-0.5">
      {(
        [
          { v: 'grid' as const, icon: LayoutGrid, label: '网格' },
          { v: 'list' as const, icon: List, label: '列表' },
        ]
      ).map(({ v, icon: Icon, label }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          title={label}
          className={cn(
            'flex size-8 items-center justify-center rounded-md transition-colors',
            value === v ? 'bg-brand-600 text-white' : 'text-ink-500 hover:bg-ink-100',
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  )
}

export function MobileFilterButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <Button variant="secondary" size="sm" onClick={onClick} className="lg:hidden">
      筛选{count > 0 && <span className="ml-0.5 rounded bg-brand-600 px-1.5 text-white">{count}</span>}
    </Button>
  )
}
