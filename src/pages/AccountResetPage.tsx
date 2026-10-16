import { CheckCircle2, Info, KeyRound, Loader2, MailWarning } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { FieldError, Input, Label } from '@/components/ui/form'
import { useAuth } from '@/hooks/useAuth'
import { useSEO } from '@/lib/seo'

/**
 * Supabase 的密码重置链接会带着 recovery 参数回跳到这里，
 * 此时 SDK 已经把会话写进本地，页面可以直接调用 updateUser 改密码。
 * 直接手敲地址进来的则没有会话，引导重新申请。
 */
export function AccountResetPage() {
  const { user, isDemo, updatePassword, requestPasswordReset } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  const [email, setEmail] = useState('')
  const [resendPending, setResendPending] = useState(false)
  const [resent, setResent] = useState(false)

  useSEO({ title: '重置密码', path: '/account/reset', noindex: true })

  // 改完密码后 2 秒回首页，避免用户停留在一个已经完成的流程页
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => navigate('/', { replace: true }), 2000)
    return () => clearTimeout(t)
  }, [done, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('密码至少 6 位')
      return
    }
    if (password !== confirm) {
      setError('两次输入的密码不一致')
      return
    }

    setPending(true)
    try {
      await updatePassword(password)
      setDone(true)
      toast.success('密码已更新')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setPending(false)
    }
  }

  async function onResend(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('请填写正确的邮箱')
      return
    }
    setResendPending(true)
    try {
      await requestPasswordReset(email.trim())
      setResent(true)
      toast.success('重置邮件已发送，请查收')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setResendPending(false)
    }
  }

  /* ------------------------------------------------------------ 完成态 */

  if (done) {
    return (
      <div className="rd-container py-16">
        <div className="mx-auto max-w-sm rounded-card border border-ink-200 bg-white p-8 text-center">
          <CheckCircle2 className="mx-auto size-11 text-emerald-500" />
          <h1 className="mt-4 text-xl font-bold text-ink-900">密码已更新</h1>
          <p className="mt-2 text-sm text-ink-600">正在返回首页……</p>
        </div>
      </div>
    )
  }

  /* --------------------------------------------------- 无会话：重新申请 */

  if (!user) {
    return (
      <div className="rd-container py-12">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-ink-900">
            <MailWarning className="size-6 text-amber-600" />
            重置密码
          </h1>

          {resent ? (
            <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[13px] leading-relaxed text-emerald-800">
              重置邮件已发送到 {email}，请点击邮件里的链接回来设置新密码。
              没收到？检查一下垃圾邮件目录。
            </p>
          ) : (
            <>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                这个页面需要邮件里的重置链接才能生效。链接是一次性的，直接打开无效 —— 重新申请一份吧。
              </p>

              {isDemo && (
                <p className="mt-5 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-800">
                  <Info className="mt-0.5 size-4 shrink-0" />
                  演示模式未连接云端，密码重置不可用。
                </p>
              )}

              <form onSubmit={onResend} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="email">注册邮箱</Label>
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
                <FieldError>{error}</FieldError>
                <Button type="submit" variant="primary" size="lg" className="w-full" disabled={resendPending || isDemo}>
                  {resendPending && <Loader2 className="animate-spin" />}
                  发送重置邮件
                </Button>
              </form>
            </>
          )}

          <p className="mt-5 text-center text-sm text-ink-500">
            想起来了？
            <Link to="/login" className="ml-1 text-brand-700 hover:underline">
              直接登录
            </Link>
          </p>
        </div>
      </div>
    )
  }

  /* ------------------------------------------------------- 设置新密码 */

  return (
    <div className="rd-container py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-ink-900">
          <KeyRound className="size-6 text-brand-600" />
          设置新密码
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">为新密码设置一个你记得住、又不容易被猜到的组合。</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="password">新密码</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
            />
          </div>
          <div>
            <Label htmlFor="confirm">确认新密码</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="再输入一次"
            />
          </div>

          <FieldError>{error}</FieldError>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            更新密码
          </Button>
        </form>

        <p className="mt-5 text-center">
          <Link to="/" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            先回到首页
          </Link>
        </p>
      </div>
    </div>
  )
}
