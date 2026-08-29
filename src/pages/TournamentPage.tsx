import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AuthLayout } from '../auth/AuthLayout'
import { apiRequest, ApiError } from '../auth/api'
import { FORMAT_LABELS, type Deck, type Participant, type Tournament } from './tournamentTypes'
import { DeckSubmitForm } from './DeckSubmitForm'
import { DeckPreview } from './DeckPreview'

export function TournamentPage() {
  const { id } = useParams<{ id: string }>()
  const { user, accessToken } = useAuth()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [participants, setParticipants] = useState<Participant[] | null>(null)
  const [myDeck, setMyDeck] = useState<Deck | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    if (!id) return
    apiRequest<Tournament>(`/tournaments/${id}`).then(setTournament)
    apiRequest<Participant[]>(`/tournaments/${id}/participants`).then(setParticipants)
  }

  useEffect(load, [id])

  const myParticipation = participants?.find((p) => p.user.id === user?.id)
  const isRegistered = myParticipation?.status === 'REGISTERED'

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
      <AuthLayout title="Torneio">
        <p className="text-sm text-gray-500">Carregando...</p>
      </AuthLayout>
    )
  }

  const activeParticipants = participants?.filter((p) => p.status === 'REGISTERED') ?? []

  return (
    <AuthLayout title={tournament.name}>
      <p className="text-sm text-gray-500">
        {FORMAT_LABELS[tournament.format]} — {new Date(tournament.scheduledAt).toLocaleString('pt-BR')}
      </p>
      <p className="mt-1 text-sm text-gray-500">Status: {tournament.status}</p>

      {user && tournament.status === 'REGISTRATION_OPEN' && (
        <div className="mt-4">
          <button
            onClick={handleToggleRegistration}
            disabled={submitting}
            className={`w-full rounded py-2 text-sm text-white disabled:opacity-50 ${
              isRegistered ? 'bg-red-600' : 'bg-gray-900'
            }`}
          >
            {isRegistered ? 'Sair do torneio' : 'Inscrever-se'}
          </button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}

      {isRegistered && myParticipation && tournament.status === 'REGISTRATION_OPEN' && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="mb-2 text-xs text-gray-500">Meu deck</p>
          {myDeck && (
            <p className="mb-2 text-xs text-gray-500">
              Última submissão: <span className="font-medium">{myDeck.validationStatus}</span>
            </p>
          )}
          <DeckSubmitForm participantId={myParticipation.id} onSubmitted={setMyDeck} />
        </div>
      )}

      {isRegistered && myDeck && tournament.status !== 'REGISTRATION_OPEN' && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="mb-2 text-xs text-gray-500">Meu deck — {myDeck.validationStatus}</p>
          <DeckPreview decodedCards={myDeck.decodedCards} />
        </div>
      )}

      <div className="mt-4 border-t border-gray-200 pt-4">
        <p className="mb-2 text-xs text-gray-500">Inscritos ({activeParticipants.length})</p>
        <ul className="space-y-1 text-sm">
          {activeParticipants.map((p) => (
            <li key={p.id}>{p.user.nickname ?? '(sem nickname)'}</li>
          ))}
        </ul>
      </div>
    </AuthLayout>
  )
}
