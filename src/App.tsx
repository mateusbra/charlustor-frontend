import { useEffect, useState } from 'react'

type HealthResponse = {
  status: string
  db: string
  timestamp: string
}

function App() {
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
        <p className="mb-4 text-xs text-gray-400">Feature 001 — Project Foundation</p>
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
      </div>
    </main>
  )
}

export default App
