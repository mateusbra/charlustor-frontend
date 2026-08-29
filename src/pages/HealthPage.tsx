import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

type HealthResponse = {
  status: string
  db: string
  timestamp: string
}

export function HealthPage() {
  const { user, logout } = useAuth()
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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-900">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold">Torneios Master Duel</h1>
        <p className="mb-4 text-xs text-gray-400">Feature 003 — User profiles</p>
        {error && <p className="text-red-600">{error}</p>}
        {!error && !health && <p className="text-gray-500">Consultando backend...</p>}
        {health && (
          <ul className="space-y-1 text-sm">
            <li>
              status: <span className="font-mono">{health.status}</span>
            </li>
            <li>
              db: <span className="font-mono">{health.db}</span>
            </li>
            <li>
              timestamp: <span className="font-mono">{health.timestamp}</span>
            </li>
          </ul>
        )}
        <div className="mt-4 border-t border-gray-200 pt-4 text-sm">
          {user ? (
            <div className="flex items-center justify-between">
              <span>
                Logado como <span className="font-medium">{user.email}</span>
              </span>
              <span className="space-x-3">
                <Link to="/profile" className="text-gray-500 underline">
                  Meu perfil
                </Link>
                <button onClick={() => logout()} className="text-gray-500 underline">
                  Sair
                </button>
              </span>
            </div>
          ) : (
            <Link to="/login" className="text-gray-500 underline">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
