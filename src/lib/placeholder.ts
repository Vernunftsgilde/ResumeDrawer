/**
 * 程序化生成预览占位图。
 *
 * 背景：种子数据阶段不能批量抓取或上传第三方预览图（版权 + 防盗链），
 * 因此 preview_kind = 'generated' 的模板在前端即时生成一张 SVG 缩略图，
 * 用色块示意版式、用文字标注格式与来源。真实预览图上传到 Supabase Storage 后
 * 把 preview_kind 改成 'self-hosted'，前端自动改用真图，无需改代码。
 */

const W = 320
const H = 400

interface Tone {
  accent: string
  tint: string
  page: string
  line: string
  strong: string
  onAccent: string
}

const TONES: Record<string, Tone> = {
  mono: { accent: '#334155', tint: '#e2e8f0', page: '#ffffff', line: '#cbd5e1', strong: '#1e293b', onAccent: '#ffffff' },
  blue: { accent: '#2563eb', tint: '#dbeafe', page: '#ffffff', line: '#cbd5e1', strong: '#0f172a', onAccent: '#ffffff' },
  navy: { accent: '#1e3a8a', tint: '#dbeafe', page: '#ffffff', line: '#cbd5e1', strong: '#0f172a', onAccent: '#ffffff' },
  green: { accent: '#059669', tint: '#d1fae5', page: '#ffffff', line: '#cbd5e1', strong: '#0f172a', onAccent: '#ffffff' },
  'warm-orange': { accent: '#ea580c', tint: '#ffedd5', page: '#ffffff', line: '#cbd5e1', strong: '#0f172a', onAccent: '#ffffff' },
  wine: { accent: '#9f1239', tint: '#ffe4e6', page: '#ffffff', line: '#cbd5e1', strong: '#0f172a', onAccent: '#ffffff' },
  morandi: { accent: '#78716c', tint: '#e7e5e4', page: '#ffffff', line: '#d6d3d1', strong: '#292524', onAccent: '#ffffff' },
  colorful: { accent: '#2563eb', tint: '#dbeafe', page: '#ffffff', line: '#cbd5e1', strong: '#0f172a', onAccent: '#ffffff' },
  dark: { accent: '#60a5fa', tint: '#1e293b', page: '#0f172a', line: '#334155', strong: '#f8fafc', onAccent: '#0f172a' },
}

const FALLBACK_TONE = TONES.blue

export interface PreviewSpec {
  title: string
  layout: string
  tone: string
  accent?: string | null
  formats?: string[]
  sourceName?: string
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function rect(x: number, y: number, w: number, h: number, fill: string, rx = 0, opacity = 1): string {
  const o = opacity === 1 ? '' : ` opacity="${opacity}"`
  return `<rect x="${x}" y="${y}" width="${Math.max(0, w).toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" rx="${rx}" fill="${fill}"${o}/>`
}

function lines(x: number, y: number, w: number, count: number, fill: string, gap = 13): string {
  let out = ''
  for (let i = 0; i < count; i++) {
    const ww = i % 3 === 2 ? w * 0.64 : w
    out += rect(x, y + i * gap, ww, 6, fill, 3)
  }
  return out
}

function sectionTitle(x: number, y: number, w: number, fill: string): string {
  return rect(x, y, w, 7, fill, 3.5, 0.85)
}

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function bodyFor(layout: string, tone: Tone): string {
  const top = 96
  const pad = 24
  let s = ''

  switch (layout) {
    case 'two-column': {
      s += sectionTitle(pad, top, 54, tone.accent)
      s += lines(pad, top + 14, 168, 4, tone.line)
      s += sectionTitle(pad, top + 82, 46, tone.accent)
      s += lines(pad, top + 96, 168, 5, tone.line)
      s += rect(212, top - 6, 84, 150, tone.tint, 6)
      s += rect(222, top + 8, 64, 7, tone.accent, 3.5, 0.9)
      s += lines(222, top + 24, 64, 5, tone.line, 12)
      s += rect(222, top + 100, 64, 7, tone.accent, 3.5, 0.9)
      s += lines(222, top + 116, 64, 3, tone.line, 12)
      break
    }
    case 'sidebar': {
      s += rect(pad, top - 6, 88, 164, tone.tint, 6)
      s += rect(34, top + 8, 68, 7, tone.accent, 3.5, 0.9)
      s += lines(34, top + 24, 68, 6, tone.line, 12)
      s += rect(34, top + 116, 68, 7, tone.accent, 3.5, 0.9)
      s += lines(34, top + 132, 68, 3, tone.line, 12)
      const mx = 128
      s += sectionTitle(mx, top, 54, tone.accent)
      s += lines(mx, top + 14, 168, 4, tone.line)
      s += sectionTitle(mx, top + 82, 46, tone.accent)
      s += lines(mx, top + 96, 168, 5, tone.line)
      break
    }
    case 'timeline': {
      const x = 30
      s += rect(x + 2, top, 3, 170, tone.tint, 1.5)
      for (let i = 0; i < 4; i++) {
        const y = top + i * 46
        s += `<circle cx="${x + 3.5}" cy="${y + 4}" r="5" fill="${tone.accent}"/>`
        s += rect(x + 20, y - 2, 90, 7, tone.strong, 3.5, 0.75)
        s += rect(x + 20, y + 12, 210, 6, tone.line, 3)
        s += rect(x + 20, y + 26, 160, 6, tone.line, 3)
      }
      break
    }
    case 'portfolio': {
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          s += rect(pad + c * 92, top + r * 66, 84, 58, r === 0 && c === 0 ? tone.tint : tone.line, 5, r === 0 && c === 0 ? 1 : 0.45)
        }
      }
      s += sectionTitle(pad, top + 148, 54, tone.accent)
      s += lines(pad, top + 162, 268, 3, tone.line)
      break
    }
    case 'infographic': {
      s += rect(pad, top, 268, 12, tone.accent, 6, 0.85)
      s += rect(pad, top + 22, 210, 12, tone.tint, 6)
      s += rect(pad, top + 44, 160, 12, tone.tint, 6)
      for (let i = 0; i < 3; i++) {
        const cx = 60 + i * 100
        s += `<circle cx="${cx}" cy="${top + 110}" r="34" fill="none" stroke="${tone.accent}" stroke-width="9" opacity="0.25"/>`
        s += `<circle cx="${cx}" cy="${top + 110}" r="34" fill="none" stroke="${tone.accent}" stroke-width="9" stroke-dasharray="${((i + 1) * 53).toFixed(0)} 214" stroke-linecap="round"/>`
      }
      s += lines(pad, top + 168, 268, 2, tone.line)
      break
    }
    case 'minimal': {
      s += sectionTitle(pad, top + 4, 44, tone.accent)
      s += lines(pad, top + 24, 200, 3, tone.line, 22)
      s += sectionTitle(pad, top + 104, 44, tone.accent)
      s += lines(pad, top + 124, 200, 3, tone.line, 22)
      break
    }
    default: {
      s += sectionTitle(pad, top, 54, tone.accent)
      s += lines(pad, top + 14, 268, 4, tone.line)
      s += sectionTitle(pad, top + 82, 46, tone.accent)
      s += lines(pad, top + 96, 268, 5, tone.line)
      s += sectionTitle(pad, top + 172, 46, tone.accent)
      s += lines(pad, top + 186, 268, 3, tone.line)
    }
  }
  return s
}

export function generatePreviewSvg(spec: PreviewSpec): string {
  const base = TONES[spec.tone] ?? FALLBACK_TONE
  const tone: Tone = spec.accent ? { ...base, accent: spec.accent } : base
  const title = clip(spec.title || '简历模板', 22)
  const source = clip(spec.sourceName || '', 20)
  const formats = (spec.formats ?? []).slice(0, 3).join(' · ')

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escapeXml(title)}">`,
    rect(0, 0, W, H, tone.page, 8),
    rect(0, 0, W, 64, tone.accent, 0),
    rect(24, 20, 132, 14, tone.onAccent, 7, 0.95),
    rect(24, 42, 76, 8, tone.onAccent, 4, 0.6),
    bodyFor(spec.layout, tone),
    `<text x="24" y="86" font-family="system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif" font-size="13" font-weight="600" fill="${tone.strong}">${escapeXml(title)}</text>`,
    source
      ? `<text x="24" y="${H - 20}" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="${tone.line}">${escapeXml(source)}</text>`
      : '',
    formats
      ? `<text x="${W - 24}" y="${H - 20}" text-anchor="end" font-family="system-ui, sans-serif" font-size="10" fill="${tone.line}">${escapeXml(formats.toUpperCase())}</text>`
      : '',
    `</svg>`,
  ].join('')
}

export function previewDataUri(spec: PreviewSpec): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generatePreviewSvg(spec))}`
}
