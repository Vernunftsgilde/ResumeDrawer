import { Bookmark, LogIn } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { listFavoriteTemplates } from '@/api/favorites'
import { EmptyState, ErrorState } from '@/components/common/states'
import { Button, buttonVariants } from '@/components/ui/button'
import { CardSkeleton } from '@/components/ui/skeleton'
import { TemplateCard } from '@/components/template/TemplateCard'
import { useAuth } from '@/hooks/useAuth'
import { useSEO } from '@/lib/seo'

export function FavoritesPage() {
  const { user, isDemo } = useAuth()
  const navigate = useNavigate()

  useSEO({ title: '我的收藏', path: '/me/favorites', noindex: true })

  const query = useQuery({
    queryKey: ['favorites'],
    queryFn: listFavoriteTemplates,
    enabled: Boolean(user),
    staleTime: 30_000,
  })

  const items = query.data ?? []

  /* ------------------------------------------------------------- 未登录 */

  if (!user) {
    return (
      <div className="rd-container py-16">
        <EmptyState
          icon={<LogIn className="size-9" />}
          title={isDemo ? '演示模式不支持登录' : '登录后查看收藏'}
          description={
            isDemo
              ? '当前站点没有连接云端数据库，登录与收藏不可用。配置 Supabase 环境变量后即可启用。'
              : '浏览和下载不需要登录，只有收藏夹需要与账号绑定。'
          }
          action={
            isDemo ? (
              <Link to="/templates" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                去逛模板库
              </Link>
            ) : (
              <Button variant="primary" size="sm" onClick={() => navigate('/login?returnTo=%2Fme%2Ffavorites')}>
                <LogIn />
                去登录
              </Button>
            )
          }
        />
      </div>
    )
  }

  /* --------------------------------------------------------------- 主体 */

  return (
    <div className="rd-container py-10">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-ink-900">
            <Bookmark className="size-5 text-brand-600" />
            我的收藏
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            {query.isSuccess ? `共 ${items.length} 个模板` : '收藏夹只与你的账号绑定，不会公开'}
          </p>
        </div>
        <Link
          to="/templates"
          className="shrink-0 text-[13px] text-ink-500 hover:text-brand-700 hover:underline"
        >
          去模板库找找
        </Link>
      </div>

      <div className="mt-6">
        {query.isPending && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {query.isError && (
          <ErrorState description={(query.error as Error).message} onRetry={() => query.refetch()} />
        )}

        {query.isSuccess && items.length === 0 && (
          <EmptyState
            icon={<Bookmark className="size-9" />}
            title="还没有收藏"
            description="在模板卡片或详情页点一下书签图标，就会收进这里。"
            action={
              <Link to="/templates" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
                去逛模板库
              </Link>
            }
          />
        )}

        {query.isSuccess && items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
