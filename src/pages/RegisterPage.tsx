import { Info, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FieldError, FieldHint, Input, Label } from '@/components/ui/form'
import { useAuth } from '@/hooks/useAuth'
import { useSEO } from '@/lib/seo'

export function RegisterPage() {
  const { signUp, isDemo } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo') || '/'

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useSEO({ title: '注册', path: '/register', noindex: true })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) return setError('请填写邮箱和密码')
    if (password.length < 6) return setError('密码至少 6 位')
    if (password !== confirm) return setError('两次输入的密码不一致')

    setPending(true)
    try {
      await signUp(email.trim(), password, displayName.trim() || undefined)
      toast.success('注册成功，已自动登录')
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
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">注册</h1>
        <p className="mt-1.5 text-sm text-ink-500">只需要邮箱和密码，用来记住你的收藏与提交记录。</p>

        {isDemo && (
          <p className="mt-5 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-800">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>当前是演示模式，未连接云端数据库，注册不可用。</span>
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">昵称（选填）</Label>
            <Input
              id="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="留空则取邮箱前缀"
              disabled={isDemo}
            />
          </div>
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
              disabled={isDemo}
            />
          </div>
          <div>
            <Label htmlFor="confirm">确认密码</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={isDemo}
            />
          </div>

          <FieldError>{error}</FieldError>
          <FieldHint>本站已关闭邮箱验证，注册后即可登录，不会向你发送营销邮件。</FieldHint>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending || isDemo}>
            {pending && <Loader2 className="animate-spin" />}
            注册并登录
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          已经有账号？
          <Link
            to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
            className="ml-1 text-brand-700 hover:underline"
          >
            去登录
          </Link>
        </p>
      </div>
    </div>
  )
}
