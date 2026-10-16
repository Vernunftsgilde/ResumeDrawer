import type {
  Audience,
  ColorTone,
  FileFormat,
  LanguageCode,
  Layout,
  LicenseType,
  SortKey,
} from './types'

/**
 * 筛选字典的唯一来源：筛选面板、徽标、详情页元信息全部读这里。
 * 注意与 supabase/01-schema.sql 中的 CHECK 约束保持一致。
 */

export interface Option<T extends string = string> {
  value: T
  label: string
  /** 色调/分类用的色块 */
  swatch?: string
}

export const FILE_FORMATS: Option<FileFormat>[] = [
  { value: 'docx', label: 'Word (.docx)' },
  { value: 'pdf', label: 'PDF' },
  { value: 'pages', label: 'Pages' },
  { value: 'psd', label: 'Photoshop (.psd)' },
  { value: 'ai', label: 'Illustrator (.ai)' },
  { value: 'fig', label: 'Figma' },
  { value: 'tex', label: 'LaTeX' },
  { value: 'md', label: 'Markdown' },
  { value: 'json', label: 'JSON' },
  { value: 'pptx', label: 'PowerPoint' },
  { value: 'indd', label: 'InDesign' },
]

export const LAYOUTS: Option<Layout>[] = [
  { value: 'single-column', label: '单栏' },
  { value: 'two-column', label: '双栏' },
  { value: 'sidebar', label: '侧边信息栏' },
  { value: 'timeline', label: '时间轴' },
  { value: 'portfolio', label: '作品集型' },
  { value: 'infographic', label: '信息图型' },
  { value: 'minimal', label: '极简' },
]

export const AUDIENCES: Option<Audience>[] = [
  { value: 'campus', label: '在校生' },
  { value: 'intern', label: '实习生' },
  { value: 'fresh-grad', label: '应届生' },
  { value: 'junior', label: '初级 1-3 年' },
  { value: 'mid', label: '中级 3-5 年' },
  { value: 'senior', label: '高级 5 年以上' },
  { value: 'executive', label: '管理 / 高管' },
  { value: 'career-changer', label: '跨行转岗' },
  { value: 'general', label: '通用' },
]

export const COLOR_TONES: Option<ColorTone>[] = [
  { value: 'mono', label: '黑白', swatch: '#334155' },
  { value: 'blue', label: '蓝色', swatch: '#2563eb' },
  { value: 'navy', label: '深蓝', swatch: '#1e3a8a' },
  { value: 'green', label: '绿色', swatch: '#059669' },
  { value: 'warm-orange', label: '暖橙', swatch: '#ea580c' },
  { value: 'wine', label: '酒红', swatch: '#9f1239' },
  { value: 'morandi', label: '莫兰迪', swatch: '#a8a29e' },
  { value: 'colorful', label: '多彩', swatch: 'linear-gradient(90deg,#2563eb,#ea580c,#059669)' },
  { value: 'dark', label: '深色底', swatch: '#0f172a' },
]

export const LANGUAGES: Option<LanguageCode>[] = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
]

export const LICENSES: Option<LicenseType>[] = [
  { value: 'free-commercial', label: '免费可商用' },
  { value: 'free-personal', label: '仅个人免费' },
  { value: 'account-required', label: '需注册账号' },
  { value: 'cc-by', label: 'CC BY 署名' },
  { value: 'cc0', label: 'CC0 公有领域' },
  { value: 'oss', label: '开源协议' },
  { value: 'unknown', label: '授权未明' },
]

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevance', label: '相关度' },
  { value: 'newest', label: '最新收录' },
  { value: 'hot', label: '最多下载' },
  { value: 'favorited', label: '最多收藏' },
]

/** 筛选面板的分组定义 —— 面板本身由这份配置渲染，加维度只改这里 */
export const FACET_GROUPS = [
  { key: 'cat', label: '分类', optionsKey: 'categories' as const },
  { key: 'fmt', label: '文件格式', options: FILE_FORMATS },
  { key: 'layout', label: '版式', options: LAYOUTS },
  { key: 'audience', label: '适用人群', options: AUDIENCES },
  { key: 'tone', label: '色调', options: COLOR_TONES },
  { key: 'lang', label: '语言', options: LANGUAGES },
  { key: 'license', label: '授权', options: LICENSES },
] as const

const labelMapCache = new Map<string, string>()

function buildLabelMap(options: Option[]): Map<string, string> {
  return new Map(options.map((o) => [o.value, o.label]))
}

const LABEL_MAPS: Record<string, Map<string, string>> = {
  fmt: buildLabelMap(FILE_FORMATS),
  layout: buildLabelMap(LAYOUTS),
  audience: buildLabelMap(AUDIENCES),
  tone: buildLabelMap(COLOR_TONES),
  lang: buildLabelMap(LANGUAGES),
  license: buildLabelMap(LICENSES),
}

/** 取值 → 中文标签；取不到时原样返回，避免字典加值后前端崩 */
export function facetLabel(group: keyof typeof LABEL_MAPS, value: string): string {
  return LABEL_MAPS[group]?.get(value) ?? value
}

/** 分类标签走动态字典（来自数据库） */
export function registerCategoryLabels(categories: { slug: string; name: string }[]): void {
  const map = new Map(categories.map((c) => [c.slug, c.name]))
  labelMapCache.clear()
  map.forEach((v, k) => labelMapCache.set(k, v))
}

export function categoryLabel(slug: string, fallback?: string): string {
  return labelMapCache.get(slug) ?? fallback ?? slug
}

/** 文件格式显示为短标签（Word / PDF / Figma …） */
export function formatShortLabel(value: string): string {
  const short: Record<string, string> = {
    docx: 'Word',
    pdf: 'PDF',
    pages: 'Pages',
    psd: 'PSD',
    ai: 'AI',
    fig: 'Figma',
    tex: 'LaTeX',
    md: 'Markdown',
    json: 'JSON',
    pptx: 'PPT',
    indd: 'InDesign',
  }
  return short[value] ?? value.toUpperCase()
}
