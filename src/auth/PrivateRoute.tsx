import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function PrivateRoute({
  children,
  requiredRole,
}: {
  children: ReactNode
  requiredRole?: string
}) {
  const { user, loading } = useAuth()

  if (loading) return <p className="p-8 text-text-muted">Carregando...</p>
  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && user.role !== requiredRole && user.role !== 'ADMIN') {
    return <p className="p-8 text-text-muted">Você não tem permissão para acessar esta página.</p>
  }

  return <>{children}</>
}
