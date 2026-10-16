import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/cn'
import { hostnameOf } from '@/lib/format'
import type { Template } from '@/lib/types'

/**
 * 来源署名。索引站的底线：每一条内容都要能追溯到原作者，
 * 卡片和详情页都必须显示，不能只在详情页里藏一行小字。
 */
export function SourceAttribution({
  template,
  className,
  showHost = false,
}: {
  template: Template
  className?: string
  showHost?: boolean
}) {
  return (
    <p className={cn('flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-ink-500', className)}>
      <span className="shrink-0">来源</span>
      <a
        href={template.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-medium text-ink-700 underline decoration-ink-300 underline-offset-2 transition-colors hover:text-brand-700 hover:decoration-brand-400"
      >
        {template.source_name}
        <ExternalLink className="size-3 shrink-0" />
      </a>
      {template.source_author && <span className="text-ink-400">· {template.source_author}</span>}
      {showHost && <span className="text-ink-400">（{hostnameOf(template.source_url)}）</span>}
    </p>
  )
}
