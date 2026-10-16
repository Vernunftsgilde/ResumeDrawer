import { Database, ExternalLink, Heart, Search, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { useSEO } from '@/lib/seo'

const PRINCIPLES = [
  {
    icon: Search,
    title: '只索引，不搬运',
    body: '我们不存储、不二次分发任何模板文件。每条记录都指向原作者的页面，下载按钮一律跳转到来源站。',
  },
  {
    icon: ShieldCheck,
    title: '授权信息优先',
    body: '每条收录都标注授权类型。授权不明的会标为「授权未明」并保留来源链接，由你自己判断是否可用。',
  },
  {
    icon: Heart,
    title: '无商业闭环',
    body: '没有付费模板、没有推广位、没有 affiliate 分成。这是一个个人维护的公益索引项目。',
  },
  {
    icon: Database,
    title: '数据可追溯',
    body: '来源站点、原作者、原始链接都在详情页完整展示。发现错误或失效欢迎直接反馈。',
  },
]

const INCLUDE = [
  '公开发布、任何人都能访问到的简历 / CV 模板',
  '授权条款明确的免费模板（含 CC、开源协议、免费可商用）',
  '设计师或机构主动公开的样稿与示例',
  '支持 ATS 解析、无障碍阅读等有实用特性的模板',
]

const EXCLUDE = [
  '需要付费购买才能获取的文件',
  '来源不明、无法追溯到原作者的转载包',
  '夹带私货的网盘引流链接（要求关注公众号、加群才能下载）',
  '含有恶意脚本、强制安装软件的下载包',
  '盗用他人作品却声称原创的模板',
]

export function AboutPage() {
  useSEO({
    title: '关于',
    description:
      '简历抽屉是一个非商业的简历模板索引站：只做索引与预览，下载一律跳转原作者页面。了解收录标准与项目定位。',
    path: '/about',
  })

  return (
    <div className="rd-container py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">关于简历抽屉</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
          简历模板散落在设计社区、开源仓库、Office 模板库、各类博客里，想找到「双栏、能过 ATS、可商用、中文」的那一份，
          往往要开十几个标签页逐个翻。简历抽屉做的就是这件事：
          <strong className="font-medium text-ink-900">把这些公开来源的模板收拢到一个可检索、可筛选的索引里</strong>，
          看清样子，然后回原作者那里下载。
        </p>

        {/* 四条原则 */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="rounded-card border border-ink-200 bg-white p-5">
              <p.icon className="size-5 text-brand-600" />
              <h2 className="mt-3 text-[15px] font-semibold text-ink-900">{p.title}</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">{p.body}</p>
            </div>
          ))}
        </div>

        {/* 收录标准 */}
        <section className="mt-10 rounded-card border border-ink-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-ink-900">我们收录什么</h2>
          <ul className="rd-prose mt-3 text-[14px]">
            {INCLUDE.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>

          <h2 className="mt-7 text-lg font-semibold text-ink-900">我们不收录什么</h2>
          <ul className="rd-prose mt-3 text-[14px]">
            {EXCLUDE.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>

        {/* 预览图说明 */}
        <section className="mt-6 rounded-card border border-ink-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-ink-900">关于预览图</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-600">
            部分条目的预览是
            <strong className="font-medium text-ink-900">根据模板的版式与色调生成的示意图</strong>
            （卡片上会标「示意图」），用来表达排版结构，不是模板的真实渲染结果。
            标注了真实预览图的条目，图片版权同样归原作者所有。
            请以点击「去来源站下载」后拿到的实际文件为准。
          </p>
        </section>

        {/* 技术栈 */}
        <section className="mt-6 rounded-card border border-ink-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-ink-900">这个站点是怎么搭的</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-600">
            前端是 React + TypeScript + Vite，样式用 Tailwind CSS；
            数据、图片与文件索引存放在 Supabase（Postgres + 对象存储）；
            搜索、筛选、计数由数据库函数完成，前端不持有任何业务秘钥。
          </p>
        </section>

        {/* 行动区 */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/submit" className={buttonVariants({ variant: 'primary', size: 'md' })}>
            提交一个模板
          </Link>
          <Link to="/copyright" className="text-[14px] leading-10 text-ink-600 hover:text-brand-700 hover:underline">
            查看版权与免责声明
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1 text-[14px] leading-10 text-ink-600 hover:text-brand-700 hover:underline"
          >
            联系我们
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
