import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AuthLayout } from '../auth/AuthLayout'
import { apiRequest, ApiError } from '../auth/api'
import {
  DECK_STATUS_BADGE,
  FORMAT_LABELS,
  TOURNAMENT_STATUS_BADGE,
  type Deck,
  type Participant,
  type Round,
  type StandingRow,
  type Tournament,
} from './tournamentTypes'
import { Badge } from '../components/Badge'
import { DeckSubmitForm } from './DeckSubmitForm'
import { DeckPreview } from './DeckPreview'
import { ReportScoreForm } from './ReportScoreForm'
import { StandingsTable } from './StandingsTable'

export function TournamentPage() {
  const { id } = useParams<{ id: string }>()
  const { user, accessToken } = useAuth()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [participants, setParticipants] = useState<Participant[] | null>(null)
  const [myDeck, setMyDeck] = useState<Deck | null>(null)
  const [rounds, setRounds] = useState<Round[] | null>(null)
  const [standings, setStandings] = useState<StandingRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    if (!id) return
    apiRequest<Tournament>(`/tournaments/${id}`).then(setTournament)
    apiRequest<Participant[]>(`/tournaments/${id}/participants`).then(setParticipants)
    apiRequest<Round[]>(`/tournaments/${id}/rounds`).then(setRounds)
    apiRequest<StandingRow[]>(`/tournaments/${id}/standings`).then(setStandings)
  }

  useEffect(load, [id])

  // RNF2 — refresh periodically so pairings/standings stay current without a manual reload.
  useEffect(() => {
    if (!id) return
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [id])

  const myParticipation = participants?.find((p) => p.user.id === user?.id)
  const isRegistered = myParticipation?.status === 'REGISTERED'

  const currentRound = rounds?.find((r) => r.status === 'IN_PROGRESS')
  const myMatch = currentRound?.matches.find(
    (m) => m.participantA.user.id === user?.id || m.participantB?.user.id === user?.id,
  )

  useEffect(() => {
    if (!myParticipation) return
    apiRequest<Deck>(`/participants/${myParticipation.id}/deck`)
      .then(setMyDeck)
      .catch(() => setMyDeck(null))
  }, [myParticipation?.id])

  const handleToggleRegistration = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await apiRequest(`/tournaments/${id}/${isRegistered ? 'withdraw' : 'register'}`, {
        method: 'POST',
        token: accessToken ?? undefined,
      })
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ação falhou')
    } finally {
      setSubmitting(false)
    }
  }

  if (!tournament) {
    return (
      <AuthLayout title="Torneio" wide>
        <p className="text-sm text-text-muted">Carregando...</p>
      </AuthLayout>
    )
  }

  const activeParticipants = participants?.filter((p) => p.status === 'REGISTERED') ?? []

  return (
    <AuthLayout title={tournament.name} wide>
      <p className="text-sm text-text-muted">
        {FORMAT_LABELS[tournament.format]} — {new Date(tournament.scheduledAt).toLocaleString('pt-BR')}
      </p>
      <div className="mt-2">
        <Badge color={TOURNAMENT_STATUS_BADGE[tournament.status]}>{tournament.status}</Badge>
      </div>

      {user && tournament.status === 'REGISTRATION_OPEN' && (
        <div className="mt-4">
          <button
            onClick={handleToggleRegistration}
            disabled={submitting}
            className={`w-full rounded py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 ${
              isRegistered ? 'bg-brand-red' : 'bg-gradient-to-r from-brand-pink to-brand-purple'
            }`}
          >
            {isRegistered ? 'Sair do torneio' : 'Inscrever-se'}
          </button>
          {error && <p className="mt-2 text-sm text-brand-red">{error}</p>}
        </div>
      )}

      {isRegistered && myParticipation && tournament.status === 'REGISTRATION_OPEN' && (
        <div className="mt-4 border-t border-panel-border pt-4">
          <p className="mb-2 text-xs text-text-muted">Meu deck</p>
          {myDeck && (
            <p className="mb-2 text-xs text-text-muted">
              Última submissão: <Badge color={DECK_STATUS_BADGE[myDeck.validationStatus]}>{myDeck.validationStatus}</Badge>
            </p>
          )}
          <DeckSubmitForm participantId={myParticipation.id} onSubmitted={setMyDeck} />
        </div>
      )}

      {isRegistered && myDeck && tournament.status !== 'REGISTRATION_OPEN' && (
        <div className="mt-4 border-t border-panel-border pt-4">
          <p className="mb-2 text-xs text-text-muted">
            Meu deck — <Badge color={DECK_STATUS_BADGE[myDeck.validationStatus]}>{myDeck.validationStatus}</Badge>
          </p>
          <DeckPreview decodedCards={myDeck.decodedCards} />
        </div>
      )}

      {tournament.status === 'IN_PROGRESS' && user && myMatch && (
        <div className="mt-4 border-t border-panel-border pt-4">
          <p className="mb-2 text-xs text-text-muted">Rodada {currentRound?.number}</p>
          <ReportScoreForm match={myMatch} myUserId={user.id} onReported={load} />
        </div>
      )}

      {(tournament.status === 'IN_PROGRESS' || tournament.status === 'COMPLETED') && standings && (
        <div className="mt-4 border-t border-panel-border pt-4">
          <p className="mb-2 text-xs text-text-muted">Standings</p>
          <StandingsTable standings={standings} />
        </div>
      )}

      <div className="mt-4 border-t border-panel-border pt-4">
        <p className="mb-2 text-xs text-text-muted">Inscritos ({activeParticipants.length})</p>
        <ul className="space-y-1 text-sm text-text">
          {activeParticipants.map((p) => (
            <li key={p.id}>{p.user.nickname ?? '(sem nickname)'}</li>
          ))}
        </ul>
      </div>
    </AuthLayout>
  )
}
