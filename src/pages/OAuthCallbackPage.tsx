import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AuthLayout } from '../auth/AuthLayout'

export function OAuthCallbackPage() {
  const { restoreSession } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    restoreSession().then((success) => navigate(success ? '/' : '/login'))
  }, [restoreSession, navigate])

  return (
    <AuthLayout title="Entrando...">
      <p className="text-sm text-text-muted">Concluindo login...</p>
    </AuthLayout>
  )
}
