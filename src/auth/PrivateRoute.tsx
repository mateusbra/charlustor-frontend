import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <p className="p-8 text-gray-500">Carregando...</p>
  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
