import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { cn } from '@/lib/cn'

export function SearchBar({
  value,
  onChange,
  placeholder = '搜索模板名称、来源或关键词',
  autoFocusShortcut = false,
  size = 'md',
  className,
}: {
  value: string
  onChange: (q: string) => void
  placeholder?: string
  /** 按 / 键聚焦搜索框 */
  autoFocusShortcut?: boolean
  size?: 'md' | 'lg'
  className?: string
}) {
  const [local, setLocal] = useState(value)
  const debounced = useDebouncedValue(local, 300)
  const lastPushed = useRef(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // 本地输入 → 防抖后写回 URL
  useEffect(() => {
    if (debounced === lastPushed.current) return
    lastPushed.current = debounced
    onChange(debounced)
  }, [debounced, onChange])

  // 外部清空筛选（比如点了"清空全部"）→ 同步回输入框
  useEffect(() => {
    if (value !== lastPushed.current) {
      lastPushed.current = value
      setLocal(value)
    }
  }, [value])

  useEffect(() => {
    if (!autoFocusShortcut) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing = target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
      if (e.key === '/' && !typing) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [autoFocusShortcut])

  return (
    <div className={cn('relative', className)}>
      <Search
        className={cn(
          'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400',
          size === 'lg' ? 'size-5' : 'size-4',
        )}
      />
      <input
        ref={inputRef}
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        aria-label="搜索模板"
        className={cn(
          'w-full rounded-xl border border-ink-200 bg-white pl-11 pr-10 text-ink-800 shadow-sm',
          'placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100',
          size === 'lg' ? 'h-14 text-[15px]' : 'h-11 text-sm',
        )}
      />
      {local && (
        <button
          type="button"
          onClick={() => setLocal('')}
          aria-label="清空搜索"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
