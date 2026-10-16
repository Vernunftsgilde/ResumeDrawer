import { MOCK_TEMPLATES, demoState } from '@/lib/mock'
import { isDemoMode, supabase } from '@/lib/supabase'
import type { Template } from '@/lib/types'

/** 切换收藏，返回切换后的状态（true = 已收藏） */
export async function toggleFavorite(templateId: string): Promise<boolean> {
  if (isDemoMode) {
    if (demoState.favorites.has(templateId)) {
      demoState.favorites.delete(templateId)
      return false
    }
    demoState.favorites.add(templateId)
    return true
  }

  const { data, error } = await supabase!.rpc('toggle_favorite', { p_template_id: templateId })
  if (error) throw new Error(error.message)
  return Boolean(data)
}

export async function listFavoriteTemplates(): Promise<Template[]> {
  if (isDemoMode) {
    return MOCK_TEMPLATES.filter((t) => demoState.favorites.has(t.id)).map((t) => ({
      ...t,
      is_favorited: true,
    }))
  }

  const { data, error } = await supabase!
    .from('favorites')
    .select('created_at, template:templates(*, category:categories(id,slug,name,color_hex))')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as unknown as { template: Record<string, unknown> | null }[]
  return rows
    .filter((r) => r.template)
    .map((r) => {
      const row = r.template as Record<string, unknown>
      const cat = row.category as { id: string; slug: string; name: string; color_hex: string } | null
      return {
        id: row.id as string,
        slug: row.slug as string,
        title: row.title as string,
        summary: (row.summary as string) ?? null,
        description: null,
        category_id: row.category_id as string,
        layout: row.layout as Template['layout'],
        audience: row.audience as Template['audience'],
        color_tone: row.color_tone as Template['color_tone'],
        accent_hex: (row.accent_hex as string) ?? null,
        has_photo_slot: Boolean(row.has_photo_slot),
        ats_friendly: Boolean(row.ats_friendly),
        languages: (row.languages as string[]) ?? [],
        file_formats: (row.file_formats as string[]) ?? [],
        page_count: (row.page_count as number) ?? null,
        license_type: row.license_type as Template['license_type'],
        license_note: null,
        source_name: row.source_name as string,
        source_author: (row.source_author as string) ?? null,
        source_url: row.source_url as string,
        download_url: row.download_url as string,
        preview_url: (row.preview_url as string) ?? null,
        preview_storage_path: (row.preview_storage_path as string) ?? null,
        preview_kind: (row.preview_kind as Template['preview_kind']) ?? 'generated',
        preview_width: null,
        preview_height: null,
        status: 'published',
        featured: Boolean(row.featured),
        submitted_by: null,
        view_count: Number(row.view_count ?? 0),
        download_count: Number(row.download_count ?? 0),
        favorite_count: Number(row.favorite_count ?? 0),
        broken_report_count: Number(row.broken_report_count ?? 0),
        link_status: (row.link_status as Template['link_status']) ?? 'unknown',
        link_checked_at: null,
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
        published_at: row.published_at as string,
        category: cat,
        tags: [],
        is_favorited: true,
      }
    })
}
