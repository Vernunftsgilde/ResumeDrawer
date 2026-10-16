import { LogIn } from 'lucide-react'
import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, buttonVariants } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'

interface AuthGateValue {
  /** 已登录返回 true；未登录则弹出引导并返回 false */
  requireLogin: (reason?: string) => boolean
}

const AuthGateContext = createContext<AuthGateValue | null>(null)

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const { user, isDemo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')

  const requireLogin = useCallback(
    (r = '登录后即可继续操作') => {
      if (user) return true
      setReason(r)
      setOpen(true)
      return false
    },
    [user],
  )

  const go = (to: string) => {
    setOpen(false)
    const returnTo = encodeURIComponent(`${location.pathname}${location.search}`)
    navigate(`${to}?returnTo=${returnTo}`)
  }

  const value = useMemo(() => ({ requireLogin }), [requireLogin])

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={isDemo ? '演示模式暂不支持登录' : reason}
        description={
          isDemo
            ? '当前站点没有连接云端数据库，登录、收藏与提交功能不可用。配置 Supabase 环境变量后即可启用。'
            : '账号只用于收藏与提交模板，浏览和下载不需要登录。'
        }
        footer={
          isDemo ? (
            <Button variant="secondary" onClick={() => setOpen(false)}>
              知道了
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                先逛逛
              </Button>
              <Button variant="primary" onClick={() => go('/login')}>
                <LogIn />
                去登录
              </Button>
            </>
          )
        }
      >
        {!isDemo && (
          <button
            type="button"
            onClick={() => go('/register')}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            还没有账号？注册一个
          </button>
        )}
      </Dialog>
    </AuthGateContext.Provider>
  )
}

export { AuthGateContext }
