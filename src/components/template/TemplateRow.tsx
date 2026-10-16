import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { DownloadIconButton } from '@/components/template/DownloadButton'
import { FavoriteButton } from '@/components/template/FavoriteButton'
import { SourceAttribution } from '@/components/template/SourceAttribution'
import { TemplatePreview } from '@/components/template/TemplatePreview'
import { facetLabel, formatShortLabel } from '@/lib/facets'
import { compactNumber } from '@/lib/format'
import type { Template } from '@/lib/types'

/** 列表视图：一屏能扫更多条，适合"我已经知道要找什么"的场景 */
export function TemplateRow({ template }: { template: Template }) {
  return (
    <article className="group relative flex gap-4 rounded-card border border-ink-200 bg-white p-3 transition-colors hover:border-brand-200 hover:bg-brand-50/30 sm:gap-5 sm:p-4">
      <Link to={`/t/${template.slug}`} className="shrink-0 after:absolute after:inset-0">
        <div className="h-24 w-20 overflow-hidden rounded-md border border-ink-200 bg-ink-100 sm:h-28 sm:w-[88px]">
          <TemplatePreview template={template} />
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate text-[15px] font-semibold text-ink-900">
            <Link to={`/t/${template.slug}`} className="transition-colors hover:text-brand-700">
              {template.title}
            </Link>
          </h3>
          <div className="relative z-10 flex shrink-0 items-center gap-0.5">
            <FavoriteButton template={template} />
            <DownloadIconButton template={template} />
          </div>
        </div>

        {template.summary && (
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-500">{template.summary}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {template.file_formats.slice(0, 3).map((f) => (
            <Badge key={f} variant="brand">
              {formatShortLabel(f)}
            </Badge>
          ))}
          <Badge>{facetLabel('layout', template.layout)}</Badge>
          <Badge>{facetLabel('audience', template.audience)}</Badge>
          {template.ats_friendly && <Badge variant="ok">ATS 友好</Badge>}
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <SourceAttribution template={template} />
          <span className="text-xs text-ink-400">{compactNumber(template.download_count)} 次下载</span>
        </div>
      </div>
    </article>
  )
}
