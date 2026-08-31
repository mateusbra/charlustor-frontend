import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { AuthLayout } from '../../auth/AuthLayout'
import { apiRequest, ApiError } from '../../auth/api'
import type { Season } from '../tournamentTypes'
import { Badge } from '../../components/Badge'

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
    <AuthLayout title="Temporadas" wide>
      <form onSubmit={handleCreate} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-text-muted">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={3}
            className="w-full rounded border border-panel-border bg-ink/40 px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-brand-pink focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-muted">Data de início</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full rounded border border-panel-border bg-ink/40 px-3 py-2 text-sm text-text focus:border-brand-pink focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-brand-red">{error}</p>}
        <button type="submit" className="w-full rounded bg-gradient-to-r from-brand-pink to-brand-purple py-2 text-sm font-semibold text-white transition hover:opacity-90">
          Criar temporada
        </button>
      </form>

      <div className="mt-6 border-t border-panel-border pt-4">
        {seasons === null && <p className="text-sm text-text-muted">Carregando...</p>}
        {seasons !== null && seasons.length === 0 && <p className="text-sm text-text-muted">Nenhuma temporada criada.</p>}
        <ul className="space-y-2">
          {seasons?.map((s) => (
            <li key={s.id} className="flex items-center justify-between border-b border-panel-border pb-2 text-sm last:border-0">
              <span className="flex items-center gap-2 text-text">
                {s.name}
                <Badge color={s.isActive ? 'green' : 'gray'}>{s.isActive ? 'ativa' : 'inativa'}</Badge>
              </span>
              {s.isActive ? (
                <button
                  onClick={() => handleClose(s.id)}
                  className="rounded border border-brand-red px-3 py-1 text-xs text-brand-red transition hover:bg-brand-red/10"
                >
                  Encerrar
                </button>
              ) : (
                <button
                  onClick={() => handleActivate(s.id)}
                  className="rounded border border-brand-cyan px-3 py-1 text-xs text-brand-cyan transition hover:bg-brand-cyan/10"
                >
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
