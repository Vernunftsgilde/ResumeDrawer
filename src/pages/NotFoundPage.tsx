import { Compass, Home, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { useSEO } from '@/lib/seo'

export function NotFoundPage() {
  useSEO({ title: '页面不存在', path: '/404', noindex: true })

  return (
    <div className="rd-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
        <Compass className="size-8" />
      </div>

      <p className="mt-6 text-[13px] font-medium tracking-widest text-ink-400">404</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-900">这个抽屉是空的</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-500">
        页面可能已经改了地址，或者链接输错了。要不去模板库看看 —— 那里有几百个模板等着翻。
      </p>

      <div className="mt-7 flex flex-col gap-2 sm:flex-row">
        <Link to="/templates" className={buttonVariants({ variant: 'primary', size: 'md' })}>
          <Layers />
          去模板库
        </Link>
        <Link to="/" className={buttonVariants({ variant: 'secondary', size: 'md' })}>
          <Home />
          回首页
        </Link>
      </div>

      <p className="mt-8 text-[13px] text-ink-400">
        觉得是我们漏掉了什么？
        <Link to="/contact?type=correction" className="ml-1 text-brand-700 hover:underline">
          告诉我们
        </Link>
      </p>
    </div>
  )
}
