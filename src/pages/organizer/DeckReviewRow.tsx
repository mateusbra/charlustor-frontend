import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { apiRequest } from '../../auth/api'
import { DeckPreview } from '../DeckPreview'
import type { Deck, Participant } from '../tournamentTypes'

export function DeckReviewRow({ participant, onRemove }: { participant: Participant; onRemove: () => void }) {
  const { accessToken } = useAuth()
  const [deck, setDeck] = useState<Deck | null | undefined>(undefined)
  const [expanded, setExpanded] = useState(false)

  const load = () => {
    apiRequest<Deck>(`/participants/${participant.id}/deck`)
      .then(setDeck)
      .catch(() => setDeck(null))
  }

  useEffect(load, [participant.id])

  const runAction = async (action: 'approve' | 'reject') => {
    await apiRequest(`/participants/${participant.id}/deck/${action}`, {
      method: 'POST',
      token: accessToken ?? undefined,
    })
    load()
  }

  return (
    <li className="text-sm">
      <div className="flex items-center justify-between">
        <span>{participant.user.nickname ?? '(sem nickname)'}</span>
        <span className="flex items-center gap-2 text-xs">
          {deck === undefined && <span className="text-gray-400">carregando...</span>}
          {deck === null && <span className="text-gray-400">sem deck</span>}
          {deck && (
            <>
              <span>{deck.validationStatus}</span>
              <button onClick={() => setExpanded((v) => !v)} className="text-gray-500 underline">
                {expanded ? 'ocultar' : 'ver'}
              </button>
            </>
          )}
          <button onClick={onRemove} className="text-red-600 underline">
            Remover
          </button>
        </span>
      </div>

      {expanded && deck && (
        <div className="mt-2 space-y-2 rounded border border-gray-200 p-2">
          <div className="flex gap-2">
            <img src={deck.mainExtraImage} alt="Deck principal + extra" className="h-24 w-auto rounded border" />
            <img src={deck.sideImage} alt="Side deck" className="h-24 w-auto rounded border" />
          </div>
          <DeckPreview decodedCards={deck.decodedCards} />
          <div className="flex gap-2">
            <button
              onClick={() => runAction('approve')}
              className="rounded border border-green-300 px-2 py-1 text-xs text-green-700"
            >
              Aprovar
            </button>
            <button
              onClick={() => runAction('reject')}
              className="rounded border border-red-300 px-2 py-1 text-xs text-red-600"
            >
              Rejeitar
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
