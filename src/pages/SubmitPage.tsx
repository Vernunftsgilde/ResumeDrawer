import { CheckCircle2, Info, Loader2, Send } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { toast } from 'sonner'
import { createSubmission, type SubmissionDraft } from '@/api/submissions'
import { Button } from '@/components/ui/button'
import { FieldError, FieldHint, Input, Label, Select, Textarea } from '@/components/ui/form'
import { useAuth } from '@/hooks/useAuth'
import { useAuthGate } from '@/hooks/useAuthGate'
import { useCategories } from '@/hooks/useTemplates'
import { FILE_FORMATS, LAYOUTS, LICENSES } from '@/lib/facets'
import { useSEO } from '@/lib/seo'
import type { FileFormat, Layout, LicenseType } from '@/lib/types'

/* ------------------------------------------------------------------ 校验 */

const httpUrl = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `请填写${label}`)
    .refine((v) => {
      try {
        const u = new URL(v)
        return u.protocol === 'http:' || u.protocol === 'https:'
      } catch {
        return false
      }
    }, `${label}需要是完整的链接，并以 http:// 或 https:// 开头`)

const schema = z.object({
  title: z.string().trim().min(2, '标题至少 2 个字').max(120, '标题最多 120 个字'),
  source_name: z.string().trim().min(1, '请填写来源站点或作者署名'),
  source_author: z.string().trim().max(80, '作者名最多 80 个字').optional(),
  source_url: httpUrl('模板原页面链接'),
  download_url: httpUrl('下载地址'),
  category_slug: z.string().trim().optional(),
  file_formats: z.array(z.string()).min(1, '至少选择一种文件格式'),
  layout: z.string().trim().optional(),
  license_type: z.string().min(1, '请选择授权方式'),
  license_note: z.string().trim().max(300, '授权说明最多 300 个字').optional(),
  note: z.string().trim().max(500, '补充说明最多 500 个字').optional(),
})

type FormValues = z.input<typeof schema>
type Errors = Partial<Record<keyof FormValues, string>>

const EMPTY: FormValues = {
  title: '',
  source_name: '',
  source_author: '',
  source_url: '',
  download_url: '',
  category_slug: '',
  file_formats: [],
  layout: '',
  license_type: 'unknown',
  license_note: '',
  note: '',
}

/* ------------------------------------------------------------------ 页面 */

export function SubmitPage() {
  const { user, isDemo } = useAuth()
  const { requireLogin } = useAuthGate()
  const navigate = useNavigate()
  const { data: categories = [] } = useCategories()

  const [values, setValues] = useState<FormValues>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [done, setDone] = useState(false)

  useSEO({
    title: '提交模板',
    description: '向简历抽屉提交一个公开来源的简历模板，经审核后收录进索引库。',
    path: '/submit',
  })

  const mutation = useMutation({
    mutationFn: (draft: SubmissionDraft) => createSubmission(draft),
    onSuccess: () => {
      setDone(true)
      toast.success('提交成功，已进入待审核队列')
    },
    onError: (err: Error) => toast.error(err.message || '提交失败，请稍后再试'),
  })

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function toggleFormat(fmt: string) {
    set(
      'file_formats',
      values.file_formats.includes(fmt)
        ? values.file_formats.filter((f) => f !== fmt)
        : [...values.file_formats, fmt],
    )
  }

  const fieldErrors = errors

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    // 未登录（或演示模式）时弹引导，不提交
    if (!requireLogin('登录后即可提交模板，并能在「我提交的」里查看审核进度')) return

    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      const next: Errors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues | undefined
        if (key && !next[key]) next[key] = issue.message
      }
      setErrors(next)
      return
    }

    const v = parsed.data
    mutation.mutate({
      title: v.title,
      source_name: v.source_name,
      source_author: v.source_author || undefined,
      source_url: v.source_url,
      download_url: v.download_url,
      category_slug: v.category_slug || undefined,
      file_formats: v.file_formats as FileFormat[],
      layout: (v.layout || undefined) as Layout | undefined,
      license_type: v.license_type as LicenseType,
      license_note: v.license_note || undefined,
      note: v.note || undefined,
    })
  }

  /* ------------------------------------------------------------ 提交成功 */

  if (done) {
    return (
      <div className="rd-container py-16">
        <div className="mx-auto max-w-md rounded-card border border-ink-200 bg-white p-8 text-center">
          <CheckCircle2 className="mx-auto size-11 text-emerald-500" />
          <h1 className="mt-4 text-xl font-bold text-ink-900">已收到你的提交</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            我们会核对来源与授权信息，通过后会收录进模板库。
            你可以在「我提交的」页面查看审核进度。
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="secondary" onClick={() => navigate('/me/submissions')}>
              查看我的提交
            </Button>
            <Button variant="primary" onClick={() => navigate('/templates')}>
              继续逛模板库
            </Button>
          </div>
        </div>
      </div>
    )
  }

  /* ---------------------------------------------------------------- 表单 */

  return (
    <div className="rd-container py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">提交模板</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
          简历抽屉只做索引，不托管文件。请填写模板的<strong className="font-medium text-ink-700">原页面链接</strong>
          与<strong className="font-medium text-ink-700">下载地址</strong>，我们审核后会跳转到你提供的原站。
        </p>

        {isDemo && (
          <p className="mt-5 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-800">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>
              当前是演示模式，站点没有连接云端数据库，提交只会保存在本机浏览器里。
              配置 <code className="rounded bg-white px-1">VITE_SUPABASE_URL</code> 与{' '}
              <code className="rounded bg-white px-1">VITE_SUPABASE_ANON_KEY</code> 后才会真正入库。
            </span>
          </p>
        )}

        {!user && !isDemo && (
          <p className="mt-5 flex gap-2 rounded-lg border border-brand-200 bg-brand-50 p-3 text-[13px] leading-relaxed text-brand-800">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>
              提交需要登录。
              <Link to="/login?returnTo=%2Fsubmit" className="mx-1 underline">
                去登录
              </Link>
              或
              <Link to="/register?returnTo=%2Fsubmit" className="mx-1 underline">
                注册一个
              </Link>
              —— 浏览和下载不需要账号。
            </span>
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-7 space-y-5">
          {/* 模板基本信息 */}
          <section className="rounded-card border border-ink-200 bg-white p-5">
            <h2 className="text-[15px] font-semibold text-ink-900">模板信息</h2>

            <div className="mt-4">
              <Label htmlFor="title">模板名称 *</Label>
              <Input
                id="title"
                value={values.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="例如：极简双栏简历模板（A4）"
              />
              <FieldError>{fieldErrors.title}</FieldError>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="category_slug">分类</Label>
                <Select
                  id="category_slug"
                  value={values.category_slug}
                  onChange={(e) => set('category_slug', e.target.value)}
                >
                  <option value="">暂不指定</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="layout">版式</Label>
                <Select id="layout" value={values.layout} onChange={(e) => set('layout', e.target.value)}>
                  <option value="">不确定</option>
                  {LAYOUTS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <Label>文件格式 *（可多选）</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {FILE_FORMATS.map((f) => {
                  const active = values.file_formats.includes(f.value)
                  return (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => toggleFormat(f.value)}
                      aria-pressed={active}
                      className={
                        active
                          ? 'rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-[13px] font-medium text-brand-700'
                          : 'rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-[13px] text-ink-600 transition-colors hover:bg-ink-100'
                      }
                    >
                      {f.label}
                    </button>
                  )
                })}
              </div>
              <FieldError>{fieldErrors.file_formats}</FieldError>
            </div>
          </section>

          {/* 来源与授权 */}
          <section className="rounded-card border border-ink-200 bg-white p-5">
            <h2 className="text-[15px] font-semibold text-ink-900">来源与授权</h2>
            <FieldHint>这两项决定了我们能否收录 —— 请填原作者页面，而不是网盘转存链接。</FieldHint>

            <div className="mt-4">
              <Label htmlFor="source_url">模板原页面链接 *</Label>
              <Input
                id="source_url"
                inputMode="url"
                value={values.source_url}
                onChange={(e) => set('source_url', e.target.value)}
                placeholder="https://example.com/resume-template"
              />
              <FieldError>{fieldErrors.source_url}</FieldError>
            </div>

            <div className="mt-4">
              <Label htmlFor="download_url">下载地址 *</Label>
              <Input
                id="download_url"
                inputMode="url"
                value={values.download_url}
                onChange={(e) => set('download_url', e.target.value)}
                placeholder="https://example.com/download/xxx.docx"
              />
              <FieldError>{fieldErrors.download_url}</FieldError>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="source_name">来源站点 / 署名 *</Label>
                <Input
                  id="source_name"
                  value={values.source_name}
                  onChange={(e) => set('source_name', e.target.value)}
                  placeholder="例如：Overleaf 模板库"
                />
                <FieldError>{fieldErrors.source_name}</FieldError>
              </div>
              <div>
                <Label htmlFor="source_author">原作者（可选）</Label>
                <Input
                  id="source_author"
                  value={values.source_author}
                  onChange={(e) => set('source_author', e.target.value)}
                  placeholder="设计师 / 团队名"
                />
                <FieldError>{fieldErrors.source_author}</FieldError>
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="license_type">授权方式 *</Label>
              <Select
                id="license_type"
                value={values.license_type}
                onChange={(e) => set('license_type', e.target.value)}
              >
                {LICENSES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </Select>
              <FieldHint>不确定时请选「授权未明」，我们会在审核时核实，不要替原作者做承诺。</FieldHint>
            </div>

            <div className="mt-4">
              <Label htmlFor="license_note">授权补充说明（可选）</Label>
              <Input
                id="license_note"
                value={values.license_note}
                onChange={(e) => set('license_note', e.target.value)}
                placeholder="例如：需注明原作者署名"
              />
              <FieldError>{fieldErrors.license_note}</FieldError>
            </div>
          </section>

          {/* 补充说明 */}
          <section className="rounded-card border border-ink-200 bg-white p-5">
            <h2 className="text-[15px] font-semibold text-ink-900">补充说明（可选）</h2>
            <div className="mt-4">
              <Textarea
                id="note"
                value={values.note}
                onChange={(e) => set('note', e.target.value)}
                placeholder="适合什么岗位、有什么亮点、需要提醒注意的地方……"
              />
              <FieldError>{fieldErrors.note}</FieldError>
            </div>
          </section>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="lg" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="animate-spin" /> : <Send />}
              提交审核
            </Button>
            <Button variant="ghost" onClick={() => setValues(EMPTY)} disabled={mutation.isPending}>
              清空
            </Button>
            <Link to="/copyright" className="ml-auto text-[13px] text-ink-500 hover:text-brand-700 hover:underline">
              收录与版权说明
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
