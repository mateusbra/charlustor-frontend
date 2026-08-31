import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { AuthLayout } from '../../auth/AuthLayout'
import { apiRequest, ApiError } from '../../auth/api'
import type { Season } from '../tournamentTypes'

export function AdminSeasonsPage() {
  const { accessToken } = useAuth()
  const [seasons, setSeasons] = useState<Season[] | null>(null)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    apiRequest<Season[]>('/admin/seasons', { token: accessToken ?? undefined }).then(setSeasons)
  }

  useEffect(load, [accessToken])

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      await apiRequest('/seasons', {
        method: 'POST',
        token: accessToken ?? undefined,
        body: JSON.stringify({ name, startDate: new Date(startDate).toISOString() }),
      })
      setName('')
      setStartDate('')
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar a temporada')
    }
  }

  const handleActivate = async (id: string) => {
    await apiRequest(`/admin/seasons/${id}/activate`, { method: 'PATCH', token: accessToken ?? undefined })
    load()
  }

  const handleClose = async (id: string) => {
    await apiRequest(`/admin/seasons/${id}/close`, { method: 'PATCH', token: accessToken ?? undefined })
    load()
  }

  return (
    <AuthLayout title="Temporadas">
      <form onSubmit={handleCreate} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={3}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Data de início</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full rounded bg-gray-900 py-2 text-sm text-white">
          Criar temporada
        </button>
      </form>

      <div className="mt-6 border-t border-gray-200 pt-4">
        {seasons === null && <p className="text-sm text-gray-500">Carregando...</p>}
        {seasons !== null && seasons.length === 0 && <p className="text-sm text-gray-500">Nenhuma temporada criada.</p>}
        <ul className="space-y-2">
          {seasons?.map((s) => (
            <li key={s.id} className="flex items-center justify-between text-sm">
              <span>
                {s.name} — <span className="text-gray-500">{s.isActive ? 'ativa' : 'inativa'}</span>
              </span>
              {s.isActive ? (
                <button onClick={() => handleClose(s.id)} className="rounded border border-gray-300 px-3 py-1 text-xs">
                  Encerrar
                </button>
              ) : (
                <button onClick={() => handleActivate(s.id)} className="rounded border border-gray-300 px-3 py-1 text-xs">
                  Ativar
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </AuthLayout>
  )
}
