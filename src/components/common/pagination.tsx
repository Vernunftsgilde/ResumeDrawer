import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/cn'

export function Pagination({
  page,
  perPage,
  total,
  onChange,
}: {
  page: number
  perPage: number
  total: number
  onChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  if (totalPages <= 1) return null

  const windowSize = 5
  let start = Math.max(1, page - Math.floor(windowSize / 2))
  const end = Math.min(totalPages, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const go = (p: number) => {
    onChange(p)
    scrollToTop()
  }

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="分页">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'px-2')}
        aria-label="上一页"
      >
        <ChevronLeft />
      </button>

      {start > 1 && (
        <>
          <button type="button" onClick={() => go(1)} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'px-2.5')}>
            1
          </button>
          {start > 2 && <span className="px-1 text-ink-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => go(p)}
          aria-current={p === page ? 'page' : undefined}
          className={cn(
            buttonVariants({ variant: p === page ? 'primary' : 'ghost', size: 'sm' }),
            'min-w-9 justify-center px-2.5',
          )}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-ink-400">…</span>}
          <button
            type="button"
            onClick={() => go(totalPages)}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'px-2.5')}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'px-2')}
        aria-label="下一页"
      >
        <ChevronRight />
      </button>
    </nav>
  )
}
