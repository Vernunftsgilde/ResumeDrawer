import { CheckCircle2, Info, Loader2, Mail, Send } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { sendContactMessage, type ContactDraft } from '@/api/contact'
import { Button } from '@/components/ui/button'
import { FieldError, FieldHint, Input, Label, Textarea } from '@/components/ui/form'
import { useAuth } from '@/hooks/useAuth'
import { useSEO } from '@/lib/seo'
import { cn } from '@/lib/cn'
import type { ContactType } from '@/lib/types'

const TYPES: { value: ContactType; label: string; hint: string }[] = [
  { value: 'general', label: '一般咨询', hint: '使用问题、合作询问、想说的话' },
  { value: 'takedown', label: '侵权下架', hint: '你是权利人，要求移除某条收录' },
  { value: 'correction', label: '信息纠错', hint: '链接失效、分类错了、授权标注有误' },
  { value: 'suggestion', label: '功能建议', hint: '希望增加哪个筛选维度、哪类模板' },
]

const PLACEHOLDER: Record<ContactType, string> = {
  general: '想问些什么？',
  takedown: '请说明你是该作品的权利人，并附上能证明权属的链接或材料说明。',
  correction: '请告诉我们是哪一条记录、错在哪里、正确的信息是什么。',
  suggestion: '希望我们增加什么？',
}

export function ContactPage() {
  const [params] = useSearchParams()
  const { user, isDemo } = useAuth()

  const initialType = (TYPES.find((t) => t.value === params.get('type'))?.value ?? 'general') as ContactType

  const [type, setType] = useState<ContactType>(initialType)
  const [email, setEmail] = useState(user?.email ?? '')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [targetSlug, setTargetSlug] = useState(params.get('slug') ?? '')
  const [errors, setErrors] = useState<{ email?: string; body?: string }>({})

  useSEO({
    title: '联系我们',
    description: '联系简历抽屉：侵权下架、信息纠错、功能建议与一般咨询。',
    path: '/contact',
  })

  const mutation = useMutation({
    mutationFn: (draft: ContactDraft) => sendContactMessage(draft),
    onSuccess: () => {
      toast.success('已收到，我们会尽快处理')
      setBody('')
    },
    onError: (err: Error) => toast.error(err.message || '发送失败，请稍后再试'),
  })

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: { email?: string; body?: string } = {}

    if (!body.trim()) next.body = '请填写正文内容'
    else if (body.trim().length < 10) next.body = '请写得再具体一些，至少 10 个字'

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = '邮箱格式不正确'

    setErrors(next)
    if (Object.keys(next).length) return

    mutation.mutate({
      type,
      email: email.trim() || undefined,
      subject: subject.trim() || undefined,
      body: body.trim(),
      target_slug: targetSlug.trim() || undefined,
    })
  }

  const activeHint = TYPES.find((t) => t.value === type)?.hint ?? ''

  return (
    <div className="rd-container py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">联系我们</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
          这是一个个人维护的项目，没有客服团队，但每条消息都会看。
          如果是<strong className="font-medium text-ink-700">要求下架</strong>，请务必留下邮箱，方便我们回复处理结果。
        </p>

        {isDemo && (
          <p className="mt-5 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-800">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>
              当前是演示模式，未连接云端数据库，消息只会保存在本机浏览器里，我们收不到。
              请稍后重试，或直接在本站仓库提交 issue。
            </span>
          </p>
        )}

        {mutation.isSuccess && !mutation.isPending && (
          <p className="mt-5 flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-800">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            消息已提交，感谢反馈。
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-7 space-y-5">
          {/* 类型切换 */}
          <div>
            <Label>反馈类型</Label>
            <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  aria-pressed={type === t.value}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors',
                    type === t.value
                      ? 'border-brand-300 bg-brand-50 text-brand-700'
                      : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-100',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <FieldHint>{activeHint}</FieldHint>
          </div>

          <div className="rounded-card border border-ink-200 bg-white p-5">
            {/* 侵权下架 / 纠错需要定位到具体条目 */}
            {(type === 'takedown' || type === 'correction') && (
              <div className="mb-4">
                <Label htmlFor="target_slug">涉及的模板（可选）</Label>
                <Input
                  id="target_slug"
                  value={targetSlug}
                  onChange={(e) => setTargetSlug(e.target.value)}
                  placeholder="粘贴详情页链接，或填写链接末尾的标识"
                />
                <FieldHint>例如详情页是 /t/minimal-two-column，就填 minimal-two-column</FieldHint>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">联系邮箱{type === 'takedown' ? ' *' : '（可选）'}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                {type === 'takedown' && <FieldHint>不留邮箱我们无法回复处理结果</FieldHint>}
                <FieldError>{errors.email}</FieldError>
              </div>
              <div>
                <Label htmlFor="subject">主题（可选）</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="一句话概括"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="body">正文 *</Label>
              <Textarea
                id="body"
                className="min-h-36"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={PLACEHOLDER[type]}
              />
              <FieldError>{errors.body}</FieldError>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="lg" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="animate-spin" /> : <Send />}
              发送
            </Button>
            <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-400">
              <Mail className="size-3.5" />
              提交后会在 1–3 天内得到回复
            </span>
          </div>
        </form>

        <p className="mt-8 text-[13px] leading-relaxed text-ink-500">
          关于收录标准与授权说明，请看
          <Link to="/copyright" className="mx-1 text-brand-700 hover:underline">
            版权与免责
          </Link>
          ；想推荐模板请走
          <Link to="/submit" className="mx-1 text-brand-700 hover:underline">
            提交模板
          </Link>
          。
        </p>
      </div>
    </div>
  )
}
