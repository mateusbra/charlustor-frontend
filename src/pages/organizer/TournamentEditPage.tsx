import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { AuthLayout } from '../../auth/AuthLayout'
import { apiRequest, ApiError } from '../../auth/api'
import type { Tournament } from './types'
import { TournamentForm, type TournamentFormValues } from './TournamentForm'

function toFormValues(t: Tournament): TournamentFormValues {
  return {
    name: t.name,
    format: t.format,
    scheduledAt: new Date(t.scheduledAt).toISOString().slice(0, 16),
    roundsCount: t.roundsCount != null ? String(t.roundsCount) : '',
    topCutSize: t.topCutSize != null ? String(t.topCutSize) : '',
  }
}

export function TournamentEditPage() {
  const { id } = useParams<{ id: string }>()
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = () => {
    if (!id) return
    apiRequest<Tournament>(`/tournaments/${id}`).then(setTournament)
  }

  useEffect(load, [id])

  const handleUpdate = async (values: TournamentFormValues) => {
    await apiRequest(`/tournaments/${id}`, {
      method: 'PATCH',
      token: accessToken ?? undefined,
      body: JSON.stringify({
        name: values.name,
        format: values.format,
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        roundsCount: values.roundsCount ? Number(values.roundsCount) : undefined,
        topCutSize: values.topCutSize ? Number(values.topCutSize) : undefined,
      }),
    })
    load()
  }

  const runAction = async (action: () => Promise<unknown>) => {
    setActionError(null)
    try {
      await action()
      load()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Ação falhou')
    }
  }

  const handleDelete = async () => {
    setActionError(null)
    try {
      await apiRequest(`/tournaments/${id}`, { method: 'DELETE', token: accessToken ?? undefined })
      navigate('/organizer/tournaments')
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Não foi possível excluir o torneio')
    }
  }

  if (!tournament) {
    return (
      <AuthLayout title="Editar torneio">
        <p className="text-sm text-gray-500">Carregando...</p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title={`Editar: ${tournament.name}`}>
      <p className="mb-4 text-sm text-gray-500">Status: {tournament.status}</p>
      <TournamentForm initialValues={toFormValues(tournament)} submitLabel="Salvar alterações" onSubmit={handleUpdate} />

      {actionError && <p className="mt-3 text-sm text-red-600">{actionError}</p>}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4 text-sm">
        {tournament.status === 'DRAFT' && (
          <button
            onClick={() => runAction(() => apiRequest(`/tournaments/${id}/open-registration`, { method: 'POST', token: accessToken ?? undefined }))}
            className="rounded border border-gray-300 px-3 py-1.5"
          >
            Abrir inscrições
          </button>
        )}
        {tournament.status === 'REGISTRATION_OPEN' && (
          <button
            onClick={() => runAction(() => apiRequest(`/tournaments/${id}/close-registration`, { method: 'POST', token: accessToken ?? undefined }))}
            className="rounded border border-gray-300 px-3 py-1.5"
          >
            Fechar inscrições
          </button>
        )}
        {tournament.status === 'DRAFT' && (
          <button onClick={handleDelete} className="rounded border border-red-300 px-3 py-1.5 text-red-600">
            Excluir torneio
          </button>
        )}
      </div>
    </AuthLayout>
  )
}
