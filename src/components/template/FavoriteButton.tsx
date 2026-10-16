import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useState } from 'react'
import { toggleFavorite } from '@/api/favorites'
import { buttonVariants } from '@/components/ui/button'
import { useAuthGate } from '@/hooks/useAuthGate'
import { cn } from '@/lib/cn'
import type { Template } from '@/lib/types'

export function FavoriteButton({
  template,
  variant = 'ghost',
  withLabel = false,
  className,
}: {
  template: Template
  variant?: 'ghost' | 'secondary'
  withLabel?: boolean
  className?: string
}) {
  const { requireLogin } = useAuthGate()
  const queryClient = useQueryClient()
  const [optimistic, setOptimistic] = useState<boolean | null>(null)
  const [errorHint, setErrorHint] = useState(false)

  const favorited = optimistic ?? template.is_favorited ?? false

  const mutation = useMutation({
    mutationFn: () => toggleFavorite(template.id),
    onSuccess: (next) => {
      setOptimistic(next)
      void queryClient.invalidateQueries({ queryKey: ['templates'] })
      void queryClient.invalidateQueries({ queryKey: ['favorites'] })
      void queryClient.invalidateQueries({ queryKey: ['template', template.slug] })
    },
    onError: () => {
      setOptimistic(!favorited)
      setErrorHint(true)
      window.setTimeout(() => setErrorHint(false), 2500)
    },
  })

  function onClick() {
    if (!requireLogin('登录后才能收藏模板')) return
    const next = !favorited
    setOptimistic(next) // 乐观更新：点了立刻变，失败再回滚
    mutation.mutate()
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={favorited}
      title={errorHint ? '操作失败，请重试' : favorited ? '取消收藏' : '收藏'}
      className={cn(
        buttonVariants({ variant: favorited ? 'outline' : variant, size: withLabel ? 'md' : 'icon' }),
        className,
      )}
    >
      {favorited ? <BookmarkCheck /> : <Bookmark />}
      {withLabel && <span>{favorited ? '已收藏' : '收藏'}</span>}
    </button>
  )
}
