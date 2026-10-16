import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { DownloadIconButton } from '@/components/template/DownloadButton'
import { FavoriteButton } from '@/components/template/FavoriteButton'
import { SourceAttribution } from '@/components/template/SourceAttribution'
import { TemplateCardBadges } from '@/components/template/TemplateMeta'
import { TemplatePreview } from '@/components/template/TemplatePreview'
import { cn } from '@/lib/cn'
import { compactNumber } from '@/lib/format'
import { isGeneratedPreview } from '@/lib/preview'
import type { Template } from '@/lib/types'

export function TemplateCard({ template, eager = false }: { template: Template; eager?: boolean }) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-card border border-ink-200 bg-white',
        'shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all',
        'hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_6px_20px_rgba(37,99,235,0.10)]',
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-ink-100">
        <TemplatePreview
          template={template}
          eager={eager}
          className="transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {template.featured && <Badge variant="solid">精选</Badge>}
          {isGeneratedPreview(template) && (
            <Badge className="bg-white/90 backdrop-blur">示意图</Badge>
          )}
          {template.link_status === 'broken' && <Badge variant="danger">链接可能失效</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15px] font-semibold leading-snug text-ink-900">
          <Link
            to={`/t/${template.slug}`}
            className="transition-colors after:absolute after:inset-0 hover:text-brand-700"
          >
            {template.title}
          </Link>
        </h3>

        {template.summary && (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-500">{template.summary}</p>
        )}

        <div className="mt-2.5">
          <TemplateCardBadges template={template} />
        </div>

        <div className="mt-2.5">
          <SourceAttribution template={template} />
        </div>

        <div className="relative z-10 mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center gap-3 text-xs text-ink-400">
            <span>{compactNumber(template.download_count)} 次下载</span>
            <span>{compactNumber(template.favorite_count)} 收藏</span>
          </div>
          <div className="flex items-center gap-0.5">
            <FavoriteButton template={template} />
            <DownloadIconButton template={template} />
          </div>
        </div>
      </div>
    </article>
  )
}
