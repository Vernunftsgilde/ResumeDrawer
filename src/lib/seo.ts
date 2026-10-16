import { useEffect } from 'react'

export const SITE_NAME = '简历抽屉'
export const SITE_URL = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '')

export interface SeoOptions {
  title: string
  description?: string
  /** 站点内路径，如 /t/xxx；用于 canonical 与 og:url */
  path?: string
  noindex?: boolean
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

const DEFAULT_DESCRIPTION =
  '简历抽屉是一个非商业的简历模板索引站：收录公开来源的简历模板，支持按版式、格式、人群、色调筛选与预览，下载一律跳转原作者页面。'

/** 单页应用的 title / meta / canonical / JSON-LD 管理 */
export function useSEO({ title, description, path, noindex, jsonLd }: SeoOptions): void {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? SITE_NAME : `${title} · ${SITE_NAME}`
    document.title = fullTitle

    const desc = description || DEFAULT_DESCRIPTION
    upsertMeta('name', 'description', desc)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('name', 'twitter:card', 'summary_large_image')

    if (SITE_URL && path) {
      upsertLink('canonical', `${SITE_URL}${path}`)
      upsertMeta('property', 'og:url', `${SITE_URL}${path}`)
    }

    upsertMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow')

    const scriptId = 'rd-jsonld'
    document.getElementById(scriptId)?.remove()
    if (jsonLd) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = scriptId
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
  }, [title, description, path, noindex, jsonLd])
}
