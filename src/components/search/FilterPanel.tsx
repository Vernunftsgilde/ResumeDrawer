import { Check } from 'lucide-react'
import type { MultiKey } from '@/hooks/useTemplateFilters'
import { useCategories } from '@/hooks/useTemplates'
import { cn } from '@/lib/cn'
import {
  AUDIENCES,
  COLOR_TONES,
  FILE_FORMATS,
  LANGUAGES,
  LAYOUTS,
  LICENSES,
  registerCategoryLabels,
} from '@/lib/facets'
import type { TemplateFilters } from '@/lib/types'

interface FacetOption {
  value: string
  label: string
  swatch?: string
}

function FacetGroup({
  label,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string
  options: FacetOption[]
  selected: string[]
  onToggle: (value: string) => void
  onClear: () => void
}) {
  return (
    <div className="border-b border-ink-100 py-4">
      <div className="mb-2.5 flex items-center justify-between">
        <h4 className="text-[13px] font-semibold text-ink-800">{label}</h4>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-ink-400 transition-colors hover:text-brand-700"
          >
            清除
          </button>
        )}
      </div>
      <ul className="space-y-0.5">
        {options.map((opt) => {
          const active = selected.includes(opt.value)
          return (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => onToggle(opt.value)}
                aria-pressed={active}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors',
                  active ? 'bg-brand-50 text-brand-800' : 'text-ink-600 hover:bg-ink-100',
                )}
              >
                <span
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                    active ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300 bg-white',
                  )}
                >
                  {active && <Check className="size-3" strokeWidth={3} />}
                </span>

                {opt.swatch && (
                  <span
                    className="size-3 shrink-0 rounded-full border border-ink-200"
                    style={{ background: opt.swatch }}
                    aria-hidden
                  />
                )}

                <span className="truncate">{opt.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function BoolRow({
  label,
  hint,
  active,
  onClick,
}: {
  label: string
  hint?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors',
        active ? 'bg-brand-50 text-brand-800' : 'text-ink-600 hover:bg-ink-100',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
          active ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300 bg-white',
        )}
      >
        {active && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span>
        {label}
        {hint && <span className="block text-xs text-ink-400">{hint}</span>}
      </span>
    </button>
  )
}

const toOptions = (list: { value: string; label: string; swatch?: string }[]): FacetOption[] =>
  list.map((o) => ({ value: o.value, label: o.label, swatch: o.swatch }))

export function FilterPanel({
  filters,
  toggle,
  clearGroup,
  update,
}: {
  filters: TemplateFilters
  toggle: (key: MultiKey, value: string) => void
  clearGroup: (key: MultiKey) => void
  update: (patch: Partial<TemplateFilters>) => void
}) {
  const { data: categories = [] } = useCategories()
  registerCategoryLabels(categories.map((c) => ({ slug: c.slug, name: c.name })))

  const groups: { key: MultiKey; label: string; options: FacetOption[] }[] = [
    {
      key: 'cat',
      label: '分类',
      options: categories.map((c) => ({ value: c.slug, label: c.name, swatch: c.color_hex })),
    },
    { key: 'fmt', label: '文件格式', options: toOptions(FILE_FORMATS) },
    { key: 'layout', label: '版式', options: toOptions(LAYOUTS) },
    { key: 'audience', label: '适用人群', options: toOptions(AUDIENCES) },
    { key: 'tone', label: '色调', options: toOptions(COLOR_TONES) },
    { key: 'lang', label: '语言', options: toOptions(LANGUAGES) },
    { key: 'license', label: '授权', options: toOptions(LICENSES) },
  ]

  return (
    <div>
      <h3 className="pb-1 pt-4 text-sm font-semibold text-ink-900">筛选</h3>

      {groups.map((g) => (
        <FacetGroup
          key={g.key}
          label={g.label}
          options={g.options}
          selected={filters[g.key]}
          onToggle={(v) => toggle(g.key, v)}
          onClear={() => clearGroup(g.key)}
        />
      ))}

      <div className="border-b border-ink-100 py-4">
        <h4 className="mb-2.5 text-[13px] font-semibold text-ink-800">其他条件</h4>
        <div className="space-y-0.5">
          <BoolRow
            label="仅看 ATS 友好"
            hint="机器可解析，投大厂更稳"
            active={filters.ats}
            onClick={() => update({ ats: !filters.ats })}
          />
          <BoolRow label="含照片位" active={filters.photo} onClick={() => update({ photo: !filters.photo })} />
        </div>
      </div>

      <p className="py-4 text-xs leading-relaxed text-ink-400">
        筛选条件全部写在网址里，可以直接把当前结果页的链接分享给别人。
      </p>
    </div>
  )
}
