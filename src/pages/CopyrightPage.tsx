import { AlertTriangle, FileWarning, Scale, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { LICENSES } from '@/lib/facets'
import { useSEO } from '@/lib/seo'

export function CopyrightPage() {
  useSEO({
    title: '版权与免责',
    description:
      '简历抽屉不持有任何模板的版权，仅提供索引与原站跳转。了解授权类型说明、侵权下架流程与免责声明。',
    path: '/copyright',
  })

  return (
    <div className="rd-container py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">版权与免责声明</h1>
        <p className="mt-1.5 text-sm text-ink-500">最后更新：2026 年 10 月</p>

        {/* 核心立场 */}
        <section className="mt-7 rounded-card border border-brand-200 bg-brand-50 p-5">
          <div className="flex gap-3">
            <Scale className="mt-0.5 size-5 shrink-0 text-brand-700" />
            <div>
              <h2 className="text-[15px] font-semibold text-brand-900">一句话立场</h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-brand-900">
                简历抽屉<strong>不持有、不托管、不二次分发</strong>任何简历模板文件，
                所有版权归原作者所有。本站只提供标题、说明、预览与
                <strong>指向原站的链接</strong>，下载行为发生在原作者的页面上。
              </p>
            </div>
          </div>
        </section>

        {/* 授权类型 */}
        <section className="mt-6 rounded-card border border-ink-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-ink-900">授权类型说明</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-600">
            站点用下面这些标签标注每条模板的授权情况。标签由收录时人工判断，仅供参考，
            <strong className="font-medium text-ink-900">不构成法律意见</strong>，商用前请以原作者页面的条款为准。
          </p>
          <dl className="mt-4 divide-y divide-ink-200 border-t border-ink-200">
            {LICENSES.map((l) => (
              <div key={l.value} className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
                <dt className="font-medium text-ink-900">{l.label}</dt>
                <dd className="text-[13px] leading-relaxed text-ink-600">{LICENSE_NOTE[l.value]}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 侵权下架 */}
        <section className="mt-6 rounded-card border border-ink-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-900">
            <FileWarning className="size-5 text-amber-600" />
            如果你是权利人，要求下架
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-600">
            我们是第三方索引，没有能力也不打算对内容主张任何权利。
            如果你认为某条记录侵犯了你的权益，请通过侵权下架通道告知我们，我们会在核实后尽快移除或替换链接。
          </p>
          <ol className="rd-prose mt-3 list-decimal text-[14px]">
            <li>准备好能证明权属的材料（原发布链接、署名截图、登记证明等）</li>
            <li>
              前往
              <Link to="/contact?type=takedown" className="mx-1 text-brand-700 hover:underline">
                侵权下架通道
              </Link>
              ，填写被投诉条目的链接与你的联系方式
            </li>
            <li>我们核实后处理，并通过你留下的邮箱回复结果</li>
          </ol>
          <div className="mt-5">
            <Link to="/contact?type=takedown" className={buttonVariants({ variant: 'danger', size: 'sm' })}>
              <Trash2 />
              提交下架申请
            </Link>
          </div>
        </section>

        {/* 免责 */}
        <section className="mt-6 rounded-card border border-ink-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-900">
            <AlertTriangle className="size-5 text-amber-600" />
            免责声明
          </h2>
          <ul className="rd-prose mt-3 text-[14px]">
            <li>
              <strong>内容来自第三方。</strong>
              所有模板由公开渠道收录，本站不对模板内容的准确性、完整性、合法性作任何明示或默示担保。
            </li>
            <li>
              <strong>授权需自行确认。</strong>
              本站标注的授权信息可能过时或判断有误。用于商业用途前，请务必回到原作者页面核对条款。
            </li>
            <li>
              <strong>外链风险自负。</strong>
              点击下载后你将离开本站，后续的一切行为（注册、付费、下载文件）均发生在第三方站点，
              与本站无关。下载文件请自行查杀病毒。
            </li>
            <li>
              <strong>链接可能失效。</strong>
              第三方页面随时可能变动。发现失效链接欢迎
              <Link to="/contact?type=correction" className="mx-1 text-brand-700 hover:underline">
                反馈
              </Link>
              ，我们无法保证每条链接永久有效。
            </li>
            <li>
              <strong>因使用本站信息产生的任何损失，本站不承担责任。</strong>
            </li>
          </ul>
        </section>

        {/* 用户内容 */}
        <section className="mt-6 rounded-card border border-ink-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-ink-900">用户提交的内容</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-600">
            用户通过「提交模板」提交的信息，视为授权本站以索引为目的公开展示。
            提交者应确保所填链接指向的是自己有权分享的内容；
            若因提交内容引发纠纷，责任由提交者承担，本站保留移除相关记录与账号的权限。
          </p>
        </section>
      </div>
    </div>
  )
}

const LICENSE_NOTE: Record<string, string> = {
  'free-commercial': '原作者声明可免费用于商业用途，通常无需署名，但建议保留来源。',
  'free-personal': '仅供个人非商业使用，用于公司招聘物料、付费产品等场景前需另行获得授权。',
  'account-required': '需要在原站注册账号后才能下载，文件本身通常免费。',
  'cc-by': 'Creative Commons 署名协议：可自由使用与改编，但必须注明原作者。',
  cc0: '作者已放弃一切权利，作品进入公有领域，可任意使用。',
  oss: '以 MIT、GPL 等开源协议发布，使用时需遵守对应协议条款。',
  unknown: '原页面没有明确授权说明。请谨慎使用，并自行联系原作者确认。',
}
