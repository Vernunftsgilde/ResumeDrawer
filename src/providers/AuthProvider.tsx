import type { Session, User } from '@supabase/supabase-js'
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isDemoMode, supabase } from '@/lib/supabase'

export interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  /** 未配置 Supabase 时为 true：可浏览，但登录/收藏/投稿不可用 */
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const DEMO_MESSAGE = '当前是演示模式（未连接云端），登录不可用。配置 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY 后即可使用。'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(!isDemoMode)

  useEffect(() => {
    if (isDemoMode || !supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setUser(next?.user ?? null)
      setLoading(false)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (isDemoMode || !supabase) throw new Error(DEMO_MESSAGE)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(translateAuthError(error.message))
  }, [])

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    if (isDemoMode || !supabase) throw new Error(DEMO_MESSAGE)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) throw new Error(translateAuthError(error.message))
  }, [])

  const signOut = useCallback(async () => {
    if (isDemoMode || !supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(translateAuthError(error.message))
  }, [])

  const requestPasswordReset = useCallback(async (email: string) => {
    if (isDemoMode || !supabase) throw new Error(DEMO_MESSAGE)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account/reset`,
    })
    if (error) throw new Error(translateAuthError(error.message))
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    if (isDemoMode || !supabase) throw new Error(DEMO_MESSAGE)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw new Error(translateAuthError(error.message))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, session, loading, isDemo: isDemoMode, signIn, signUp, signOut, requestPasswordReset, updatePassword }),
    [user, session, loading, signIn, signUp, signOut, requestPasswordReset, updatePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return '邮箱或密码不正确'
  if (m.includes('email not confirmed')) return '邮箱尚未验证，请检查收件箱，或在 Supabase 控制台关闭邮箱验证'
  if (m.includes('user already registered')) return '该邮箱已注册，请直接登录'
  if (m.includes('password should be')) return '密码强度不足，请至少 6 位'
  if (m.includes('rate limit')) return '操作过于频繁，请稍后再试'
  if (m.includes('unable to validate email')) return '邮箱格式不正确'
  return message
}
