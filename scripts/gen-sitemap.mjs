#!/usr/bin/env node
/**
 * 生成 public/sitemap.xml
 *
 * 数据源是 src/data/seed.json（与 supabase/04-seed.sql 同源），
 * 因此构建时不需要连数据库，CI 里也能跑。
 *
 * 用法：
 *   VITE_SITE_URL=https://example.com npm run sitemap
 * 未设置 VITE_SITE_URL 时退化为 http://localhost:5173，方便本地预览产物。
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// 读 .env / .env.local，跟 vite 保持同一套变量解析规则
const env = loadEnv('', root, 'VITE_')
const SITE_URL = (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')

const seed = JSON.parse(readFileSync(resolve(root, 'src/data/seed.json'), 'utf8'))

/** 静态页面。changefreq / priority 按页面性质给，不是拍脑袋全填 1.0 */
const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/templates', changefreq: 'daily', priority: '0.9' },
  { path: '/submit', changefreq: 'monthly', priority: '0.5' },
  { path: '/about', changefreq: 'yearly', priority: '0.4' },
  { path: '/copyright', changefreq: 'yearly', priority: '0.3' },
  { path: '/contact', changefreq: 'yearly', priority: '0.4' },
]

const today = new Date().toISOString().slice(0, 10)

const entries = [
  ...STATIC_PAGES,
  ...seed.templates.map((t) => ({
    path: `/t/${t.slug}`,
    changefreq: 'weekly',
    priority: t.featured ? '0.8' : '0.6',
  })),
]

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- 由 scripts/gen-sitemap.mjs 生成，请勿手改 -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${esc(SITE_URL + e.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

// robots.txt 里的 Sitemap: 必须是绝对地址，写相对路径搜索引擎会忽略。
// 因此跟 sitemap 一起生成，保证两者永远指向同一个域名。
const robots = `# 由 scripts/gen-sitemap.mjs 生成，请勿手改
User-agent: *
Allow: /

# SPA 内部路由与登录态页面不收录
Disallow: /login
Disallow: /register
Disallow: /me
Disallow: /account
Disallow: /admin

Sitemap: ${SITE_URL}/sitemap.xml
`

mkdirSync(resolve(root, 'public'), { recursive: true })
writeFileSync(resolve(root, 'public/sitemap.xml'), xml, 'utf8')
writeFileSync(resolve(root, 'public/robots.txt'), robots, 'utf8')

console.log(`sitemap.xml 已生成：${entries.length} 条（${STATIC_PAGES.length} 静态页 + ${seed.templates.length} 模板页）`)
console.log(`robots.txt  已生成：Sitemap -> ${SITE_URL}/sitemap.xml`)
