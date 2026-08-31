import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { AuthLayout } from '../auth/AuthLayout'

type HealthResponse = {
  status: string
  db: string
  timestamp: string
}

export function HealthPage() {
  const { user } = useAuth()
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL as string

    fetch(`${apiUrl}/health`)
      .then((res) => res.json())
      .then((data: HealthResponse) => setHealth(data))
      .catch(() => setError('Não foi possível conectar ao backend'))
  }, [])

  return (
    <AuthLayout title="Torneios semanais de Master Duel">
      <p className="mb-4 text-sm text-text-muted">
        {user ? (
          <>
            Bem-vindo de volta, <span className="font-medium text-text">{user.email}</span>.
          </>
        ) : (
          'Entre pra se inscrever nos próximos torneios.'
        )}
      </p>
      {error && <p className="text-sm text-brand-red">{error}</p>}
      {!error && !health && <p className="text-sm text-text-muted">Consultando backend...</p>}
      {health && (
        <ul className="space-y-1 border-t border-panel-border pt-3 text-xs text-text-muted">
          <li>
            status: <span className="font-mono text-brand-cyan">{health.status}</span>
          </li>
          <li>
            db: <span className="font-mono text-brand-cyan">{health.db}</span>
          </li>
          <li>
            timestamp: <span className="font-mono">{health.timestamp}</span>
          </li>
        </ul>
      )}
    </AuthLayout>
  )
}
