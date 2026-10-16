import { AlertTriangle, FolderOpen, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description?: ReactNode
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-ink-300 bg-white/60 px-6 py-16 text-center">
      <div className="mb-4 text-ink-400">{icon ?? <FolderOpen className="size-9" />}</div>
      <h3 className="text-[15px] font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({
  title = '加载失败',
  description,
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-red-200 bg-red-50/60 px-6 py-16 text-center">
      <AlertTriangle className="mb-4 size-9 text-red-400" />
      <h3 className="text-[15px] font-semibold text-ink-900">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-ink-600">
        {description ?? '请求没有成功，可能是网络不稳定或数据源暂时不可用。'}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          <RotateCcw />
          重试
        </Button>
      )}
    </div>
  )
}
