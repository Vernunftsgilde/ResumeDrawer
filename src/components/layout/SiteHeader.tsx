import { Bookmark, LogIn, LogOut, Menu, UserPlus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'

const NAV = [
  { to: '/templates', label: '模板库' },
  { to: '/submit', label: '提交模板' },
  { to: '/about', label: '关于' },
]

export function SiteHeader() {
  const { user, signOut, isDemo } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const email = user?.email ?? ''
  const displayName = (user?.user_metadata?.display_name as string) || email.split('@')[0] || '我'

  async function onSignOut() {
    setUserOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/85 backdrop-blur">
      <div className="rd-container flex h-14 items-center gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="简历抽屉首页">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
              <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M7.5 8h9M7.5 12h9M7.5 16h5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-ink-900">简历抽屉</span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-1.5 text-sm transition-colors',
                  isActive ? 'bg-ink-100 font-medium text-ink-900' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {user ? (
            <div className="relative" ref={userRef}>
              <button
                type="button"
                onClick={() => setUserOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-700 transition-colors hover:bg-ink-100"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-100 text-[13px] font-medium text-brand-700">
                  {displayName.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-28 truncate sm:block">{displayName}</span>
              </button>

              {userOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 overflow-hidden rounded-xl border border-ink-200 bg-white py-1 shadow-lg">
                  <div className="truncate px-3 py-1.5 text-xs text-ink-400">{email}</div>
                  <Link
                    to="/me/favorites"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-100"
                  >
                    <Bookmark className="size-4" />
                    我的收藏
                  </Link>
                  <Link
                    to="/me/submissions"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-100"
                  >
                    我提交的
                  </Link>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-700 hover:bg-ink-100"
                  >
                    <LogOut className="size-4" />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                <LogIn />
                登录
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                <UserPlus />
                注册
              </Button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="菜单"
            className="flex size-9 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-ink-100 md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-ink-200 bg-white md:hidden">
          <div className="rd-container flex flex-col py-2">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn('rounded-lg px-3 py-2.5 text-sm', isActive ? 'bg-ink-100 font-medium text-ink-900' : 'text-ink-700')
                }
              >
                {item.label}
              </NavLink>
            ))}
            {!user && (
              <div className="mt-2 flex gap-2 px-3 pb-1">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate('/login')}>
                  登录
                </Button>
                <Button variant="primary" size="sm" className="flex-1" onClick={() => navigate('/register')}>
                  注册
                </Button>
              </div>
            )}
            {isDemo && (
              <p className="px-3 pb-2 pt-1 text-xs text-ink-400">演示模式：未连接云端，登录与收藏不可用</p>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
