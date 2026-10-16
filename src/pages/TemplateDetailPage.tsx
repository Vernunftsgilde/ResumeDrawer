import { useMutation, useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowLeft, ExternalLink, Eye, Heart, Link2Off, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { getTemplateBySlug, recordView, reportBrokenLink, searchTemplates } from '@/api/templates'
import { ErrorState } from '@/components/common/states'
import { DownloadButton } from '@/components/template/DownloadButton'
import { FavoriteButton } from '@/components/template/FavoriteButton'
import { SourceAttribution } from '@/components/template/SourceAttribution'
import { TemplateMetaBar } from '@/components/template/TemplateMeta'
import { TemplatePreview } from '@/components/template/TemplatePreview'
import { TemplateCard } from '@/components/template/TemplateCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { FieldHint, Label, Select, Textarea } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { categoryLabel, facetLabel } from '@/lib/facets'
import { compactNumber, formatDate, hostnameOf } from '@/lib/format'
import { isGeneratedPreview } from '@/lib/preview'
import { useSEO } from '@/lib/seo'

export function TemplateDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [reportOpen, setReportOpen] = useState(false)
  const [reason, setReason] = useState('404')
  const [detail, setDetail] = useState('')
  const viewed = useRef<string | null>(null)

  const query = useQuery({
    queryKey: ['template', slug],
    queryFn: () => getTemplateBySlug(slug as string),
    enabled: Boolean(slug),
  })

  const template = query.data ?? null

  useEffect(() => {
    if (!slug || viewed.current === slug) return
    viewed.current = slug
    void recordView(slug)
  }, [slug])

  useSEO({
    title: template ? template.title : '模板详情',
    description: template?.summary ?? undefined,
    path: template ? `/t/${template.slug}` : undefined,
    jsonLd: template
      ? {
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: template.title,
          description: template.summary ?? undefined,
          datePublished: template.published_at,
          isAccessibleForFree: true,
          creator: template.source_author
            ? { '@type': 'Person', name: template.source_author }
            : { '@type': 'Organization', name: template.source_name },
          url: template.source_url,
        }
      : undefined,
  })

  const related = useQuery({
    queryKey: ['templates', 'related', template?.category?.slug],
    queryFn: () =>
      searchTemplates(
        {
          q: '',
          cat: template?.category?.slug ? [template.category.slug] : [],
          fmt: [],
          layout: [],
          audience: [],
          tone: [],
          lang: [],
          license: [],
          ats: false,
          photo: false,
          sort: 'hot',
          page: 1,
          view: 'grid',
        },
        { perPage: 5 },
      ),
    enabled: Boolean(template?.category?.slug),
    staleTime: 60_000,
  })

  const reportMutation = useMutation({
    mutationFn: () => reportBrokenLink(slug as string, reason, detail || undefined),
    onSuccess: () => {
      toast.success('已收到反馈，我们会尽快复核这条链接')
      setReportOpen(false)
      setDetail('')
    },
    onError: (e: Error) => toast.error(e.message || '提交失败，请稍后重试'),
  })

  if (query.isLoading) {
    return (
      <div className="rd-container py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <Skeleton className="aspect-[4/5] w-full rounded-card" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="rd-container py-8">
        <ErrorState onRetry={() => void query.refetch()} />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="rd-container py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-xl font-semibold text-ink-900">没有找到这份模板</h1>
          <p className="mt-2 text-sm text-ink-500">它可能已经下架，或者链接输错了。</p>
          <Link to="/templates" className="mt-6 inline-flex text-sm text-brand-700 hover:underline">
            ← 回到模板库
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rd-container py-6">
      <nav className="mb-5 flex items-center gap-1.5 text-[13px] text-ink-500">
        <Link to="/" className="hover:text-brand-700">
          首页
        </Link>
        <span className="text-ink-300">/</span>
        <Link to="/templates" className="hover:text-brand-700">
          模板库
        </Link>
        {template.category && (
          <>
            <span className="text-ink-300">/</span>
            <Link to={`/templates?cat=${template.category.slug}`} className="hover:text-brand-700">
              {categoryLabel(template.category.slug, template.category.name)}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        {/* 预览 */}
        <div>
          <div className="overflow-hidden rounded-card border border-ink-200 bg-white p-2">
            <div className="aspect-[4/5] overflow-hidden rounded-lg bg-ink-100">
              <TemplatePreview template={template} eager />
            </div>
          </div>
          <p className="mt-2.5 text-center text-xs text-ink-400">
            {isGeneratedPreview(template)
              ? '示意图：按版式与配色程序化生成，仅用于表达结构，非模板实际效果'
              : `预览图 · ${hostnameOf(template.source_url)}`}
          </p>
        </div>

        {/* 信息 */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {template.featured && <Badge variant="solid">精选</Badge>}
            {template.link_status === 'broken' && (
              <Badge variant="danger">
                <AlertTriangle className="size-3" />
                链接可能失效
              </Badge>
            )}
            <Badge>{facetLabel('license', template.license_type)}</Badge>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-[28px]">{template.title}</h1>

          {template.summary && (
            <p className="mt-3 text-[15px] leading-relaxed text-ink-600">{template.summary}</p>
          )}

          <div className="mt-5 rounded-card border border-brand-100 bg-brand-50/60 p-4">
            <SourceAttribution template={template} className="text-[13px]" showHost />
            <p className="mt-2 text-xs leading-relaxed text-ink-500">
              本站不托管模板文件。点击下方按钮会打开来源页面，是否需要注册账号、是否收费，都以原站说明为准。
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <DownloadButton template={template} />
            <FavoriteButton template={template} variant="secondary" withLabel />
            <Button variant="ghost" size="md" onClick={() => setReportOpen(true)} title="外链打不开？告诉我们">
              <Link2Off />
              链接失效
            </Button>
          </div>

          <div className="mt-6">
            <TemplateMetaBar template={template} />
          </div>

          {template.tags && template.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {template.tags.map((tag) => (
                <Link key={tag.id} to={`/templates?q=${encodeURIComponent(tag.name)}`}>
                  <Badge className="cursor-pointer transition-colors hover:bg-ink-100">#{tag.name}</Badge>
                </Link>
              ))}
            </div>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-ink-100 pt-5 text-sm sm:grid-cols-4">
            <div>
              <dt className="flex items-center gap-1 text-xs text-ink-400">
                <Eye className="size-3.5" />
                浏览
              </dt>
              <dd className="mt-0.5 font-medium text-ink-800">{compactNumber(template.view_count)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-400">下载</dt>
              <dd className="mt-0.5 font-medium text-ink-800">{compactNumber(template.download_count)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs text-ink-400">
                <Heart className="size-3.5" />
                收藏
              </dt>
              <dd className="mt-0.5 font-medium text-ink-800">{compactNumber(template.favorite_count)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-400">收录时间</dt>
              <dd className="mt-0.5 font-medium text-ink-800">{formatDate(template.published_at)}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-4 text-[13px]">
            <a
              href={template.source_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1.5 text-ink-600 transition-colors hover:text-brand-700"
            >
              查看来源页面
              <ExternalLink className="size-3.5" />
            </a>
            <Link
              to={`/contact?type=takedown&slug=${template.slug}`}
              className="text-ink-400 transition-colors hover:text-ink-700"
            >
              这条内容侵权了？申请下架
            </Link>
          </div>
        </div>
      </div>

      {/* 相关推荐 */}
      {related.data && related.data.items.length > 0 && (
        <section className="mt-14">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-ink-900">
              更多{categoryLabel(template.category?.slug ?? '', template.category?.name)}模板
            </h2>
            {template.category && (
              <Link to={`/templates?cat=${template.category.slug}`} className="text-sm text-brand-700 hover:underline">
                查看全部分类 →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.data.items
              .filter((t) => t.slug !== template.slug)
              .slice(0, 4)
              .map((t) => (
                <TemplateCard key={t.id} template={t} />
              ))}
          </div>
        </section>
      )}

      <div className="mt-10">
        <Link to="/templates" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-700">
          <ArrowLeft className="size-4" />
          返回模板库
        </Link>
      </div>

      <Dialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="反馈链接问题"
        description="外链会随时间失效，你的反馈能帮后来的人少踩一次坑。"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReportOpen(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              disabled={reportMutation.isPending}
              onClick={() => reportMutation.mutate()}
            >
              {reportMutation.isPending && <Loader2 className="animate-spin" />}
              提交反馈
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">问题类型</Label>
            <Select id="reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="404">页面打不开（404）</option>
              <option value="login-required">需要登录才能下载</option>
              <option value="moved">页面已迁移</option>
              <option value="malware">疑似危险站点</option>
              <option value="other">其他</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="detail">补充说明（选填）</Label>
            <Textarea
              id="detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="比如：点击后跳转到站点首页，找不到模板入口"
            />
            <FieldHint>不需要登录也能提交。</FieldHint>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
