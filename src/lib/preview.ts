import { previewDataUri } from '@/lib/placeholder'
import { supabase } from '@/lib/supabase'
import type { Template } from '@/lib/types'

/**
 * 决定一张模板卡片 / 详情页该显示什么图：
 *   self-hosted → Supabase Storage 公开 URL（真实预览图）
 *   remote      → 外链图片（尽量不用，容易被防盗链）
 *   generated   → 前端按版式与配色即时生成的 SVG 占位图
 */
export function previewSrc(t: Template): string {
  if (t.preview_kind === 'self-hosted' && t.preview_storage_path && supabase) {
    return supabase.storage.from('previews').getPublicUrl(t.preview_storage_path).data.publicUrl
  }
  if (t.preview_kind === 'remote' && t.preview_url) return t.preview_url

  return previewDataUri({
    title: t.title,
    layout: t.layout,
    tone: t.color_tone,
    accent: t.accent_hex,
    formats: t.file_formats,
    sourceName: t.source_name,
  })
}

export function isGeneratedPreview(t: Template): boolean {
  return t.preview_kind !== 'self-hosted' && t.preview_kind !== 'remote'
}
