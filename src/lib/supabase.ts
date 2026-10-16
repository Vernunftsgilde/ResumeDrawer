import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

/**
 * 未配置 Supabase 环境变量时，站点以「演示模式」运行：
 * 使用内置示例数据渲染全流程，认证不可用，所有写操作返回提示。
 * 填上环境变量（本地 .env.local 或 Cloudflare Pages 环境变量）即自动切到真实云端数据。
 */
export const isSupabaseConfigured = Boolean(url && anonKey)
export const isDemoMode = !isSupabaseConfigured

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('未配置 Supabase，当前处于演示模式')
  }
  return supabase
}
