import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { AuthGateProvider } from '@/providers/AuthGateProvider'
import { HomePage } from '@/pages/HomePage'
import { TemplatesPage } from '@/pages/TemplatesPage'
import { TemplateDetailPage } from '@/pages/TemplateDetailPage'
import { SubmitPage } from '@/pages/SubmitPage'
import { AboutPage } from '@/pages/AboutPage'
import { CopyrightPage } from '@/pages/CopyrightPage'
import { ContactPage } from '@/pages/ContactPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { MySubmissionsPage } from '@/pages/MySubmissionsPage'
import { AccountResetPage } from '@/pages/AccountResetPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

/**
 * 路由表与 SiteHeader / SiteFooter / TemplateCard 里的实际链接逐条对齐：
 *   详情页是 /t/:slug（不是 /templates/:slug）
 *   /me/favorites、/me/submissions 来自用户下拉菜单
 *   /account/reset 是 AuthProvider 里 resetPasswordForEmail 的 redirectTo
 *
 * RootLayout 用了 <ScrollRestoration />，因此必须用 createBrowserRouter 数据路由。
 * AuthGateProvider 挂在这里（而不是 main.tsx）是因为它内部要用 useNavigate。
 */
const routes: RouteObject[] = [
  {
    element: (
      <AuthGateProvider>
        <RootLayout />
      </AuthGateProvider>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 't/:slug', element: <TemplateDetailPage /> },
      { path: 'submit', element: <SubmitPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'copyright', element: <CopyrightPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'me/favorites', element: <FavoritesPage /> },
      { path: 'me/submissions', element: <MySubmissionsPage /> },
      { path: 'account/reset', element: <AccountResetPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
