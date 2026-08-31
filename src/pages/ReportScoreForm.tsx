import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { apiRequest, ApiError } from '../auth/api'
import type { Match } from './tournamentTypes'

export function ReportScoreForm({ match, myUserId, onReported }: { match: Match; myUserId: string; onReported: () => void }) {
  const { accessToken } = useAuth()
  const [score, setScore] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isA = match.participantA.user.id === myUserId
  const opponentName = (isA ? match.participantB : match.participantA)?.user.nickname ?? '(sem nickname)'
  const myReport = isA ? match.reportedScoreA : match.reportedScoreB

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await apiRequest(`/matches/${match.id}/report`, {
        method: 'POST',
        token: accessToken ?? undefined,
        body: JSON.stringify({ score }),
      })
      onReported()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível reportar o placar')
    } finally {
      setSubmitting(false)
    }
  }

  if (match.resultStatus === 'CONFIRMED') {
    return <p className="text-sm text-brand-green">Confirmado: {match.confirmedScore}</p>
  }

  if (match.resultStatus === 'DISPUTED') {
    return <p className="text-sm text-brand-red">Placar em disputa — aguardando o organizador resolver.</p>
  }

  if (myReport) {
    return <p className="text-sm text-text-muted">Você reportou {myReport}. Aguardando o adversário.</p>
  }

  return (
    <div>
      <p className="mb-2 text-sm text-text-muted">Sua partida contra {opponentName}</p>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Ex.: 2-1"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          required
          className="flex-1 rounded border border-panel-border bg-ink/40 px-2 py-1 text-sm text-text placeholder:text-text-muted focus:border-brand-pink focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-gradient-to-r from-brand-pink to-brand-purple px-3 py-1 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          Reportar
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-brand-red">{error}</p>}
    </div>
  )
}
