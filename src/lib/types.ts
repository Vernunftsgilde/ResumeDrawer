/**
 * 领域类型。字段名与 Supabase 表结构保持一致（snake_case），
 * 避免在数据层做一次额外的字段映射。
 */

export type Layout =
  | 'single-column'
  | 'two-column'
  | 'sidebar'
  | 'timeline'
  | 'portfolio'
  | 'infographic'
  | 'minimal'

export type Audience =
  | 'campus'
  | 'intern'
  | 'fresh-grad'
  | 'junior'
  | 'mid'
  | 'senior'
  | 'executive'
  | 'career-changer'
  | 'general'

export type ColorTone =
  | 'mono'
  | 'blue'
  | 'navy'
  | 'green'
  | 'warm-orange'
  | 'wine'
  | 'morandi'
  | 'colorful'
  | 'dark'

export type LicenseType =
  | 'free-commercial'
  | 'free-personal'
  | 'account-required'
  | 'cc-by'
  | 'cc0'
  | 'oss'
  | 'unknown'

export type FileFormat =
  | 'docx'
  | 'pdf'
  | 'pages'
  | 'psd'
  | 'ai'
  | 'fig'
  | 'tex'
  | 'md'
  | 'pptx'
  | 'html'
  | 'json'
  | 'indd'

export type LanguageCode = 'zh' | 'en' | 'ja' | 'de' | 'fr' | 'es' | 'ko'

export type PreviewKind = 'generated' | 'self-hosted' | 'remote'
export type TemplateStatus = 'draft' | 'published' | 'takedown'
export type LinkStatus = 'ok' | 'broken' | 'unknown'

export interface Category {
  id: string
  slug: string
  name: string
  short_desc: string | null
  color_hex: string
  icon: string | null
  sort_order: number
}

export interface Tag {
  id: string
  slug: string
  name: string
  kind: 'topic' | 'feature' | 'style' | 'industry'
}

export interface Template {
  id: string
  slug: string
  title: string
  summary: string | null
  description: string | null
  category_id: string
  layout: Layout
  audience: Audience
  color_tone: ColorTone
  accent_hex: string | null
  has_photo_slot: boolean
  ats_friendly: boolean
  languages: string[]
  file_formats: string[]
  page_count: number | null
  license_type: LicenseType
  license_note: string | null
  source_name: string
  source_author: string | null
  source_url: string
  download_url: string
  preview_url: string | null
  preview_storage_path: string | null
  preview_kind: PreviewKind
  preview_width: number | null
  preview_height: number | null
  status: TemplateStatus
  featured: boolean
  submitted_by: string | null
  view_count: number
  download_count: number
  favorite_count: number
  broken_report_count: number
  link_status: LinkStatus
  link_checked_at: string | null
  created_at: string
  updated_at: string
  published_at: string

  /** 关联数据（由查询层 join 后填充，非表字段） */
  category?: Pick<Category, 'id' | 'slug' | 'name' | 'color_hex'> | null
  tags?: Pick<Tag, 'id' | 'slug' | 'name'>[] | null
  is_favorited?: boolean
}

export type SortKey = 'relevance' | 'newest' | 'hot' | 'favorited'
export type ViewMode = 'grid' | 'list'

export interface TemplateFilters {
  q: string
  cat: string[]
  fmt: string[]
  layout: string[]
  audience: string[]
  tone: string[]
  lang: string[]
  license: string[]
  ats: boolean
  photo: boolean
  sort: SortKey
  page: number
  view: ViewMode
}

export interface SearchResult {
  items: Template[]
  total: number
  page: number
  perPage: number
}

export interface Stats {
  templates: number
  categories: number
  sources: number
}

export interface Submission {
  id: string
  submitted_by: string | null
  title: string
  source_url: string
  download_url: string
  source_name: string
  source_author: string | null
  category_slug: string | null
  file_formats: string[]
  layout: Layout | null
  note: string | null
  status: 'pending' | 'approved' | 'rejected'
  review_note: string | null
  created_at: string
}

export type ContactType = 'general' | 'takedown' | 'correction' | 'suggestion'
