import { useQuery } from '@tanstack/react-query'
import { ArrowRight, FileSearch, Layers, Link2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchHomeLists } from '@/api/templates'
import { SearchBar } from '@/components/search/SearchBar'
import { TemplateCard } from '@/components/template/TemplateCard'
import { GridSkeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/states'
import { SITE_NAME, useSEO } from '@/lib/seo'

export function HomePage() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const home = useQuery({ queryKey: ['home'], queryFn: fetchHomeLists, staleTime: 60_000 })

  useSEO({
    title: SITE_NAME,
    description:
      '简历抽屉收录公开来源的简历模板，支持按版式、格式、人群、色调筛选与预览；只做索引，下载一律跳转原作者页面。',
    path: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '简历抽屉',
      description: '公开来源的简历模板索引站',
      potentialAction: {
        '@type': 'SearchAction',
        target: '/templates?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  })

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-ink-200 bg-gradient-to-b from-brand-50/70 to-white">
        <div className="rd-container py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              找一份合适的简历模板，不用来回翻十几个网站
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-600">
              简历抽屉收录公开来源的简历模板：按版式、文件格式、适用人群和色调筛，先看预览，
              满意了再跳到原作者页面下载。
            </p>

            <div className="mx-auto mt-8 max-w-xl">
              <SearchBar
                value={q}
                onChange={(next) => {
                  setQ(next)
                  navigate(`/templates?q=${encodeURIComponent(next)}`)
                }}
                size="lg"
                autoFocusShortcut
                placeholder="试试「应届」「双栏」「LaTeX」…"
              />
              <p className="mt-2.5 text-xs text-ink-400">
                按 <kbd className="rounded border border-ink-300 bg-white px-1">/</kbd> 快速聚焦搜索框
              </p>
            </div>

            {home.data && (
              <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-ink-600">
                <span>
                  <b className="text-lg font-semibold text-ink-900">{home.data.stats.templates}</b> 份模板
                </span>
                <span className="text-ink-300">·</span>
                <span>
                  <b className="text-lg font-semibold text-ink-900">{home.data.stats.categories}</b> 个分类
                </span>
                <span className="text-ink-300">·</span>
                <span>
                  来自 <b className="text-lg font-semibold text-ink-900">{home.data.stats.sources}</b> 个公开来源
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 分类快捷入口 */}
      {home.data && (
        <section className="rd-container py-10">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-ink-900">按分类找</h2>
            <Link to="/templates" className="text-sm text-brand-700 hover:underline">
              全部模板 →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {home.data.categories.map((c) => (
              <Link
                key={c.slug}
                to={`/templates?cat=${c.slug}`}
                className="group inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-700 transition-all hover:border-brand-300 hover:shadow-sm"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: c.color_hex }}
                  aria-hidden
                />
                <span className="font-medium">{c.name}</span>
                {c.short_desc && (
                  <span className="hidden text-xs text-ink-400 sm:inline">· {c.short_desc}</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 精选 */}
      <section className="rd-container pb-4">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-ink-900">精选模板</h2>
          <Link to="/templates?sort=favorited" className="text-sm text-brand-700 hover:underline">
            看更多 →
          </Link>
        </div>
        {home.isLoading ? (
          <GridSkeleton count={6} />
        ) : home.isError ? (
          <ErrorState onRetry={() => void home.refetch()} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {home.data?.featured.map((t, i) => (
              <TemplateCard key={t.id} template={t} eager={i < 4} />
            ))}
          </div>
        )}
      </section>

      {/* 最新 */}
      <section className="rd-container pb-4 pt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-ink-900">最新收录</h2>
          <Link to="/templates?sort=newest" className="text-sm text-brand-700 hover:underline">
            看更多 →
          </Link>
        </div>
        {home.isLoading ? (
          <GridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {home.data?.latest.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        )}
      </section>

      {/* 边界说明 */}
      <section className="rd-container py-12">
        <div className="grid gap-4 rounded-card border border-ink-200 bg-white p-6 sm:grid-cols-3">
          <div className="flex gap-3">
            <FileSearch className="mt-0.5 size-5 shrink-0 text-brand-600" />
            <div>
              <h3 className="text-sm font-semibold text-ink-900">只做索引</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
                收录的是模板的元信息与预览，帮你快速定位；真正的文件在原作者那里。
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link2 className="mt-0.5 size-5 shrink-0 text-brand-600" />
            <div>
              <h3 className="text-sm font-semibold text-ink-900">下载走外链</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
                点「去原站下载」会打开来源页面，授权与账号要求以原站为准。
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Layers className="mt-0.5 size-5 shrink-0 text-brand-600" />
            <div>
              <h3 className="text-sm font-semibold text-ink-900">无商业闭环</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
                没有充值、没有推广位排序。发现好模板也可以
                <Link to="/submit" className="ml-0.5 text-brand-700 hover:underline">
                  提交给我们
                </Link>
                。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/templates"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            开始浏览模板库
            <ArrowRight className="size-4" />
          </Link>
          <Link to="/about" className="text-sm text-ink-600 hover:text-brand-700 hover:underline">
            了解这个项目
          </Link>
        </div>
      </section>
    </div>
  )
}
