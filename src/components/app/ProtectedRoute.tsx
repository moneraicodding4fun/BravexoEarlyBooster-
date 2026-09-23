import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/lib/auth'
import type { Role } from '@/lib/mockDb'
import { ROUTES } from '@/lib/constants'

/**
 * Role gate. `/admin` is Master Admin only; `/portal` is invited clients only.
 * Unauthenticated visitors bounce to /login; authenticated visitors landing
 * on a section they don't have access to are sent to their own home.
 */
export function ProtectedRoute({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="bx-app flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to={ROUTES.login} state={{ from: location.pathname }} replace />
  }

  if (!roles.includes(session.role)) {
    return <Navigate to={session.role === 'admin' ? ROUTES.admin : ROUTES.portal} replace />
  }

  return <>{children}</>
}
