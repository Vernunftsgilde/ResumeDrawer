import { ExternalLink, LogIn, Trash2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { deleteSubmission, listMySubmissions } from '@/api/submissions'
import { EmptyState, ErrorState } from '@/components/common/states'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { CardSkeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { formatDate, hostnameOf } from '@/lib/format'
import { useSEO } from '@/lib/seo'
import type { Submission } from '@/lib/types'

const STATUS_META: Record<Submission['status'], { label: string; variant: 'warn' | 'ok' | 'danger' }> = {
  pending: { label: '待审核', variant: 'warn' },
  approved: { label: '已收录', variant: 'ok' },
  rejected: { label: '未通过', variant: 'danger' },
}

export function MySubmissionsPage() {
  const { user, isDemo } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  useSEO({ title: '我提交的', path: '/me/submissions', noindex: true })

  const query = useQuery({
    queryKey: ['my-submissions'],
    queryFn: listMySubmissions,
    enabled: Boolean(user) || isDemo,
    staleTime: 30_000,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteSubmission(id),
    onSuccess: () => {
      toast.success('已撤回该提交')
      qc.invalidateQueries({ queryKey: ['my-submissions'] })
    },
    onError: (err: Error) => toast.error(err.message || '撤回失败，请稍后再试'),
  })

  if (!user && !isDemo) {
    return (
      <div className="rd-container py-16">
        <EmptyState
          icon={<LogIn className="size-9" />}
          title="登录后查看提交记录"
          description="提交模板需要账号，这样才能把审核结果反馈给你。"
          action={
            <Button variant="primary" size="sm" onClick={() => navigate('/login?returnTo=%2Fme%2Fsubmissions')}>
              <LogIn />
              去登录
            </Button>
          }
        />
      </div>
    )
  }

  const items = query.data ?? []

  return (
    <div className="rd-container py-10">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">我提交的</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            {query.isSuccess ? `共 ${items.length} 条记录` : '只有你自己能看到这份列表'}
          </p>
        </div>
        <Link to="/submit" className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'shrink-0')}>
          再提交一个
        </Link>
      </div>

      {isDemo && (
        <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-800">
          演示模式：未连接云端，这里显示的是保存在本机浏览器里的提交记录。
        </p>
      )}

      <div className="mt-6 space-y-3">
        {query.isPending &&
          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}

        {query.isError && (
          <ErrorState description={(query.error as Error).message} onRetry={() => query.refetch()} />
        )}

        {query.isSuccess && items.length === 0 && (
          <EmptyState
            title="还没有提交过模板"
            description="发现好的公开模板？提交给我们，审核通过后会收录进索引库。"
            action={
              <Link to="/submit" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
                提交模板
              </Link>
            }
          />
        )}

        {query.isSuccess &&
          items.map((s) => {
            const meta = STATUS_META[s.status]
            return (
              <article key={s.id} className="rounded-card border border-ink-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[15px] font-semibold text-ink-900">{s.title}</h2>
                    <p className="mt-1 text-[13px] text-ink-500">
                      来源：{s.source_name}
                      {s.source_author ? ` · ${s.source_author}` : ''} · {hostnameOf(s.source_url)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                    <span className="text-[13px] text-ink-400">{formatDate(s.created_at)}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-ink-600">
                  <a
                    href={s.source_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 text-brand-700 hover:underline"
                  >
                    原页面
                    <ExternalLink className="size-3.5" />
                  </a>
                  <a
                    href={s.download_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 text-brand-700 hover:underline"
                  >
                    下载地址
                    <ExternalLink className="size-3.5" />
                  </a>
                  {s.file_formats?.length > 0 && (
                    <span className="text-ink-400">{s.file_formats.join(' / ').toUpperCase()}</span>
                  )}
                </div>

                {s.note && (
                  <p className="mt-3 rounded-lg bg-ink-50 p-3 text-[13px] leading-relaxed text-ink-600">{s.note}</p>
                )}

                {s.review_note && (
                  <p
                    className={cn(
                      'mt-3 rounded-lg p-3 text-[13px] leading-relaxed',
                      s.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700',
                    )}
                  >
                    审核意见：{s.review_note}
                  </p>
                )}

                {s.status === 'pending' && (
                  <div className="mt-4 flex items-center gap-3 border-t border-ink-200 pt-3">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => remove.mutate(s.id)}
                      disabled={remove.isPending}
                    >
                      <Trash2 />
                      撤回
                    </Button>
                    <span className="text-[13px] text-ink-400">审核通常在 1–3 天内完成</span>
                  </div>
                )}
              </article>
            )
          })}
      </div>
    </div>
  )
}
