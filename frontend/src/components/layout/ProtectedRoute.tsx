import { useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getOdooLoginUrl, hasAuthSession, isEmbeddedPortalRuntime } from '../../lib/auth-session'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = hasAuthSession()
  const isEmbedded = isEmbeddedPortalRuntime()

  useEffect(() => {
    if (!isAuthenticated && isEmbedded) {
      window.location.replace(getOdooLoginUrl())
    }
  }, [isAuthenticated, isEmbedded])

  if (!isAuthenticated) {
    if (isEmbedded) return null
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
