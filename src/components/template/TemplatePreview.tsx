import { ImageOff } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { previewSrc } from '@/lib/preview'
import type { Template } from '@/lib/types'

export function TemplatePreview({
  template,
  className,
  eager = false,
}: {
  template: Template
  className?: string
  eager?: boolean
}) {
  const src = useMemo(() => previewSrc(template), [template])
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={cn('flex items-center justify-center bg-ink-100 text-ink-400', className)}>
        <div className="flex flex-col items-center gap-1.5">
          <ImageOff className="size-6" />
          <span className="text-xs">暂无预览</span>
        </div>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={`${template.title} 预览`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('h-full w-full object-cover', className)}
    />
  )
}
