import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth'
import { Toaster } from '@/components/ui/toaster'
import { ProtectedRoute } from '@/components/app/ProtectedRoute'
import { AppShell } from '@/components/app/AppShell'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { AdminOverview } from '@/pages/admin/AdminOverview'
import { ClientsPage } from '@/pages/admin/Clients'
import { VaultPage } from '@/pages/admin/Vault'
import { PortalOverview } from '@/pages/portal/PortalOverview'
import { ReviewResponder } from '@/pages/portal/ReviewResponder'
import { AutoBlogPage } from '@/pages/portal/AutoBlog'
import { ConnectPage } from '@/pages/portal/Connect'
import { ROUTES } from '@/lib/constants'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public site — untouched, isolated from the portal theme */}
          <Route path={ROUTES.home} element={<Landing />} />

          {/* Auth */}
          <Route path={ROUTES.login} element={<Login />} />

          {/* Master Admin only */}
          <Route
            path={ROUTES.admin}
            element={
              <ProtectedRoute roles={['admin']}>
                <AppShell section="admin">
                  <AdminOverview />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.adminClients}
            element={
              <ProtectedRoute roles={['admin']}>
                <AppShell section="admin">
                  <ClientsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.adminVault}
            element={
              <ProtectedRoute roles={['admin']}>
                <AppShell section="admin">
                  <VaultPage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          {/* Invited clients only */}
          <Route
            path={ROUTES.portal}
            element={
              <ProtectedRoute roles={['client']}>
                <AppShell section="portal">
                  <PortalOverview />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.portalReviews}
            element={
              <ProtectedRoute roles={['client']}>
                <AppShell section="portal">
                  <ReviewResponder />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.portalBlog}
            element={
              <ProtectedRoute roles={['client']}>
                <AppShell section="portal">
                  <AutoBlogPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.portalConnect}
            element={
              <ProtectedRoute roles={['client']}>
                <AppShell section="portal">
                  <ConnectPage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}
