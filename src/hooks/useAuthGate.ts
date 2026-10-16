import { useContext } from 'react'
import { AuthGateContext } from '@/providers/AuthGateProvider'

export function useAuthGate() {
  const ctx = useContext(AuthGateContext)
  if (!ctx) throw new Error('useAuthGate 必须在 <AuthGateProvider> 内使用')
  return ctx
}
