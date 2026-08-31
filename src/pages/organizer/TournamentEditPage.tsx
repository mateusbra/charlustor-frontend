import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { AuthLayout } from '../../auth/AuthLayout'
import { apiRequest, ApiError } from '../../auth/api'
import { TOURNAMENT_STATUS_BADGE, type Participant, type Round, type Tournament } from '../tournamentTypes'
import { TournamentForm, type TournamentFormValues } from './TournamentForm'
import { DeckReviewRow } from './DeckReviewRow'
import { DisputedMatchRow } from './DisputedMatchRow'
import { Badge } from '../../components/Badge'

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
      <AuthLayout title="Editar torneio" wide>
        <p className="text-sm text-text-muted">Carregando...</p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title={`Editar: ${tournament.name}`} wide>
      <div className="mb-4">
        <Badge color={TOURNAMENT_STATUS_BADGE[tournament.status]}>{tournament.status}</Badge>
      </div>
      <TournamentForm initialValues={toFormValues(tournament)} submitLabel="Salvar alterações" onSubmit={handleUpdate} />

      {actionError && (
        <div className="mt-3 text-sm text-brand-red">
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

      <div className="mt-4 flex flex-wrap gap-2 border-t border-panel-border pt-4 text-sm">
        {tournament.status === 'DRAFT' && (
          <button
            onClick={() => runAction(() => apiRequest(`/tournaments/${id}/open-registration`, { method: 'POST', token: accessToken ?? undefined }))}
            className="rounded border border-panel-border px-3 py-1.5 text-text transition hover:border-brand-pink"
          >
            Abrir inscrições
          </button>
        )}
        {tournament.status === 'REGISTRATION_OPEN' && (
          <button
            onClick={() => runAction(() => apiRequest(`/tournaments/${id}/close-registration`, { method: 'POST', token: accessToken ?? undefined }))}
            className="rounded border border-panel-border px-3 py-1.5 text-text transition hover:border-brand-pink"
          >
            Fechar inscrições
          </button>
        )}
        {tournament.status === 'DRAFT' && (
          <button onClick={handleDelete} className="rounded border border-brand-red px-3 py-1.5 text-brand-red transition hover:bg-brand-red/10">
            Excluir torneio
          </button>
        )}
        {(tournament.status === 'REGISTRATION_OPEN' || tournament.status === 'REGISTRATION_CLOSED') && (
          <button
            onClick={() => runAction(() => apiRequest(`/tournaments/${id}/start`, { method: 'POST', token: accessToken ?? undefined }))}
            className="rounded bg-gradient-to-r from-brand-pink to-brand-purple px-3 py-1.5 font-semibold text-white transition hover:opacity-90"
          >
            Iniciar torneio
          </button>
        )}
        {tournament.status === 'IN_PROGRESS' && (
          <>
            <button
              onClick={() => runAction(() => apiRequest(`/tournaments/${id}/advance-round`, { method: 'POST', token: accessToken ?? undefined }))}
              className="rounded bg-gradient-to-r from-brand-pink to-brand-purple px-3 py-1.5 font-semibold text-white transition hover:opacity-90"
            >
              Avançar rodada
            </button>
            {tournament.format === 'SWISS_TOP_CUT' && !rounds?.some((r) => r.phase === 'TOP_CUT') && (
              <button
                onClick={() => runAction(() => apiRequest(`/tournaments/${id}/start-top-cut`, { method: 'POST', token: accessToken ?? undefined }))}
                className="rounded border border-panel-border px-3 py-1.5 text-text transition hover:border-brand-pink"
              >
                Iniciar Top Cut
              </button>
            )}
            <button
              onClick={() => runAction(() => apiRequest(`/tournaments/${id}/complete`, { method: 'POST', token: accessToken ?? undefined }))}
              className="rounded border border-panel-border px-3 py-1.5 text-text transition hover:border-brand-pink"
            >
              Encerrar torneio
            </button>
          </>
        )}
      </div>

      {rounds && rounds.length > 0 && (
        <div className="mt-4 border-t border-panel-border pt-4">
          <p className="mb-2 text-xs text-text-muted">Rodadas</p>
          <ul className="space-y-1 text-sm text-text">
            {rounds.map((r) => (
              <li key={r.id}>
                Rodada {r.number} {r.phase === 'TOP_CUT' && '(Top Cut)'} — <span className="text-text-muted">{r.status}</span> — {r.matches.length} partida(s)
              </li>
            ))}
          </ul>
        </div>
      )}

      {rounds && rounds.some((r) => r.matches.some((m) => m.resultStatus === 'DISPUTED')) && (
        <div className="mt-4 border-t border-panel-border pt-4">
          <p className="mb-2 text-xs text-text-muted">Partidas em disputa</p>
          <ul className="space-y-2">
            {rounds
              .flatMap((r) => r.matches)
              .filter((m) => m.resultStatus === 'DISPUTED')
              .map((m) => (
                <DisputedMatchRow key={m.id} match={m} onResolved={load} />
              ))}
          </ul>
        </div>
      )}

      <div className="mt-4 border-t border-panel-border pt-4">
        <p className="mb-2 text-xs text-text-muted">
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
