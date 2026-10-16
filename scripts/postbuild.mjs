#!/usr/bin/env node
/**
 * 构建后处理：为静态托管补一份 404.html。
 *
 * Cloudflare Pages 已经由 public/_redirects 兜底，但 Netlify、GitHub Pages、
 * 各类对象存储静态站会去找 404.html。内容与 index.html 完全一致，
 * 于是直接访问 /t/xxx 刷新时也能落到 SPA 入口而不是 404。
 */

import { copyFileSync, existsSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')

if (!existsSync(resolve(dist, 'index.html'))) {
  console.error('dist/index.html 不存在，请先执行 vite build')
  process.exit(1)
}

copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))

// 同时给 GitHub Pages 一个 .nojekyll，避免 _headers / _redirects 之类
// 下划线开头的文件被 Jekyll 过滤掉
writeFileSync(resolve(dist, '.nojekyll'), '', 'utf8')

console.log('postbuild: 已生成 dist/404.html 与 dist/.nojekyll')
