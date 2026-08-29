import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { AuthLayout } from '../../auth/AuthLayout'
import { apiRequest, ApiError } from '../../auth/api'
import type { Participant, Round, Tournament } from '../tournamentTypes'
import { TournamentForm, type TournamentFormValues } from './TournamentForm'
import { DeckReviewRow } from './DeckReviewRow'

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
  const [participants, setParticipants] = useState<Participant[] | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingParticipants, setPendingParticipants] = useState<string[] | null>(null)
  const [rounds, setRounds] = useState<Round[] | null>(null)

  const load = () => {
    if (!id) return
    apiRequest<Tournament>(`/tournaments/${id}`).then(setTournament)
    apiRequest<Participant[]>(`/tournaments/${id}/participants`).then(setParticipants)
    apiRequest<Round[]>(`/tournaments/${id}/rounds`, { token: accessToken ?? undefined })
      .then(setRounds)
      .catch(() => setRounds(null))
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
    setPendingParticipants(null)
    try {
      await action()
      load()
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message)
        const body = err.body as { pendingParticipants?: string[] } | undefined
        if (Array.isArray(body?.pendingParticipants)) setPendingParticipants(body.pendingParticipants)
      } else {
        setActionError('Ação falhou')
      }
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

  const handleRemoveParticipant = (userId: string) =>
    runAction(() =>
      apiRequest(`/tournaments/${id}/participants/${userId}`, { method: 'DELETE', token: accessToken ?? undefined }),
    )

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

      {actionError && (
        <div className="mt-3 text-sm text-red-600">
          <p>{actionError}</p>
          {pendingParticipants && pendingParticipants.length > 0 && (
            <ul className="mt-1 list-disc pl-5 text-xs">
              {pendingParticipants.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          )}
        </div>
      )}

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
        {(tournament.status === 'REGISTRATION_OPEN' || tournament.status === 'REGISTRATION_CLOSED') && (
          <button
            onClick={() => runAction(() => apiRequest(`/tournaments/${id}/start`, { method: 'POST', token: accessToken ?? undefined }))}
            className="rounded bg-gray-900 px-3 py-1.5 text-white"
          >
            Iniciar torneio
          </button>
        )}
        {tournament.status === 'IN_PROGRESS' && (
          <>
            <button
              onClick={() => runAction(() => apiRequest(`/tournaments/${id}/advance-round`, { method: 'POST', token: accessToken ?? undefined }))}
              className="rounded bg-gray-900 px-3 py-1.5 text-white"
            >
              Avançar rodada
            </button>
            <button
              onClick={() => runAction(() => apiRequest(`/tournaments/${id}/complete`, { method: 'POST', token: accessToken ?? undefined }))}
              className="rounded border border-gray-300 px-3 py-1.5"
            >
              Encerrar torneio
            </button>
          </>
        )}
      </div>

      {rounds && rounds.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="mb-2 text-xs text-gray-500">Rodadas</p>
          <ul className="space-y-1 text-sm">
            {rounds.map((r) => (
              <li key={r.id}>
                Rodada {r.number} — {r.status} — {r._count.matches} partida(s)
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 border-t border-gray-200 pt-4">
        <p className="mb-2 text-xs text-gray-500">
          Inscritos ({participants?.filter((p) => p.status === 'REGISTERED').length ?? 0})
        </p>
        <ul className="space-y-2">
          {participants
            ?.filter((p) => p.status === 'REGISTERED')
            .map((p) => (
              <DeckReviewRow key={p.id} participant={p} onRemove={() => handleRemoveParticipant(p.user.id)} />
            ))}
        </ul>
      </div>
    </AuthLayout>
  )
}
