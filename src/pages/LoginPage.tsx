import { Info, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FieldError, Input, Label } from '@/components/ui/form'
import { useAuth } from '@/hooks/useAuth'
import { useSEO } from '@/lib/seo'

export function LoginPage() {
  const { signIn, isDemo } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useSEO({ title: '登录', path: '/login', noindex: true })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('请填写邮箱和密码')
      return
    }
    setPending(true)
    try {
      await signIn(email.trim(), password)
      toast.success('登录成功')
      navigate(returnTo, { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="rd-container py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">登录</h1>
        <p className="mt-1.5 text-sm text-ink-500">浏览和下载不需要登录，登录后可以收藏模板并提交新模板。</p>

        {isDemo && (
          <p className="mt-5 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-800">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>
              当前是演示模式，站点没有连接云端数据库，登录不可用。
              <br />
              配置 <code className="rounded bg-white px-1">VITE_SUPABASE_URL</code> 与{' '}
              <code className="rounded bg-white px-1">VITE_SUPABASE_ANON_KEY</code> 后即可启用。
            </span>
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isDemo}
            />
          </div>
          <div>
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
              disabled={isDemo}
            />
          </div>

          <FieldError>{error}</FieldError>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending || isDemo}>
            {pending && <Loader2 className="animate-spin" />}
            登录
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          还没有账号？
          <Link
            to={`/register?returnTo=${encodeURIComponent(returnTo)}`}
            className="ml-1 text-brand-700 hover:underline"
          >
            注册一个
          </Link>
        </p>
      </div>
    </div>
  )
}
