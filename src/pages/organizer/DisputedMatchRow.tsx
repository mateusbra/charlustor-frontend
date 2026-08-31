import { useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { apiRequest, ApiError } from '../../auth/api'
import type { Match } from '../tournamentTypes'

export function DisputedMatchRow({ match, onResolved }: { match: Match; onResolved: () => void }) {
  const { accessToken } = useAuth()
  const [score, setScore] = useState('')
  const [error, setError] = useState<string | null>(null)

  const nameA = match.participantA.user.nickname ?? '(sem nickname)'
  const nameB = match.participantB?.user.nickname ?? '(sem nickname)'

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      await apiRequest(`/matches/${match.id}/resolve`, {
        method: 'POST',
        token: accessToken ?? undefined,
        body: JSON.stringify({ score }),
      })
      onResolved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível resolver a disputa')
    }
  }

  return (
    <li className="rounded border border-brand-red/40 bg-brand-red/5 p-2 text-sm">
      <p className="text-text">
        {nameA} relatou <span className="font-mono text-brand-gold">{match.reportedScoreA}</span> — {nameB} relatou{' '}
        <span className="font-mono text-brand-gold">{match.reportedScoreB}</span>
      </p>
      <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
        <input
          type="text"
          placeholder={`Placar final (perspectiva de ${nameA}, ex. 2-1)`}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          required
          className="flex-1 rounded border border-panel-border bg-ink/40 px-2 py-1 text-xs text-text placeholder:text-text-muted focus:border-brand-pink focus:outline-none"
        />
        <button type="submit" className="rounded bg-gradient-to-r from-brand-pink to-brand-purple px-3 py-1 text-xs font-semibold text-white transition hover:opacity-90">
          Resolver
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-brand-red">{error}</p>}
    </li>
  )
}
