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
    <li className="rounded border border-red-200 p-2 text-sm">
      <p>
        {nameA} relatou <span className="font-mono">{match.reportedScoreA}</span> — {nameB} relatou{' '}
        <span className="font-mono">{match.reportedScoreB}</span>
      </p>
      <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
        <input
          type="text"
          placeholder={`Placar final (perspectiva de ${nameA}, ex. 2-1)`}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          required
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
        />
        <button type="submit" className="rounded bg-gray-900 px-3 py-1 text-xs text-white">
          Resolver
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </li>
  )
}
