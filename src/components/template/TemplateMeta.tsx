import { Badge } from '@/components/ui/badge'
import { facetLabel, formatShortLabel } from '@/lib/facets'
import type { Template } from '@/lib/types'

/** 详情页的元信息徽标组 */
export function TemplateMetaBar({ template }: { template: Template }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {template.file_formats.map((f) => (
        <Badge key={f} variant="brand">
          {formatShortLabel(f)}
        </Badge>
      ))}
      <Badge>{facetLabel('layout', template.layout)}</Badge>
      <Badge>{facetLabel('audience', template.audience)}</Badge>
      <Badge>{facetLabel('tone', template.color_tone)}</Badge>
      {template.page_count && <Badge>{template.page_count} 页</Badge>}
      {template.ats_friendly && <Badge variant="ok">ATS 友好</Badge>}
      {template.has_photo_slot && <Badge variant="warn">含照片位</Badge>}
    </div>
  )
}

/** 卡片上的精简徽标（信息密度优先，只留最有用的三四个） */
export function TemplateCardBadges({ template }: { template: Template }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {template.file_formats.slice(0, 3).map((f) => (
        <Badge key={f} variant="brand">
          {formatShortLabel(f)}
        </Badge>
      ))}
      <Badge>{facetLabel('layout', template.layout)}</Badge>
      {template.ats_friendly && <Badge variant="ok">ATS</Badge>}
    </div>
  )
}
