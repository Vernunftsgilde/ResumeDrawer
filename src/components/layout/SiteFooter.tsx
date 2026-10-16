import { Link } from 'react-router-dom'
import { isDemoMode } from '@/lib/supabase'

const LINKS = [
  { to: '/about', label: '关于本站' },
  { to: '/copyright', label: '版权与免责' },
  { to: '/contact', label: '联系我们' },
  { to: '/submit', label: '提交模板' },
]

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-ink-200 bg-white">
      <div className="rd-container py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-md">
            <p className="text-[15px] font-semibold text-ink-900">简历抽屉</p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
              一个非商业的简历模板索引站。只收录公开来源的模板信息与预览，
              <span className="font-medium text-ink-700">不托管任何模板文件</span>
              ，下载一律跳转原作者页面。模板版权归各自的原作者所有。
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="text-[13px] text-ink-600 transition-colors hover:text-brand-700">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-ink-100 pt-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} 简历抽屉 · 个人非商业项目</p>
          <p>
            认为某条内容侵犯了你的权利？
            <Link to="/contact?type=takedown" className="ml-1 text-brand-700 hover:underline">
              提交下架申请
            </Link>
          </p>
        </div>

        {isDemoMode && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            当前为演示模式（未配置 Supabase），页面数据来自内置示例，登录、收藏与提交功能不可用。
          </p>
        )}
      </div>
    </footer>
  )
}
