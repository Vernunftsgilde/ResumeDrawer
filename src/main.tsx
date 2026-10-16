import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { router } from '@/router'
import { AuthProvider } from '@/providers/AuthProvider'
import { queryClient } from '@/lib/queryClient'

import '@/styles/globals.css'

const container = document.getElementById('root')
if (!container) throw new Error('找不到 #root 挂载点')

/**
 * Provider 顺序：QueryClient > Auth > Router。
 * AuthGateProvider 依赖 useNavigate，所以挂在 router.tsx 的根 route element 内，
 * 而不是放在这里（放在这里会拿不到 router context）。
 */
createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
