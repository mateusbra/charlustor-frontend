import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { apiRequest } from '../../auth/api'
import { DeckPreview } from '../DeckPreview'
import { DECK_STATUS_BADGE, type Deck, type Participant } from '../tournamentTypes'
import { Badge } from '../../components/Badge'

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
        <span className="text-text">{participant.user.nickname ?? '(sem nickname)'}</span>
        <span className="flex items-center gap-2 text-xs">
          {deck === undefined && <span className="text-text-muted">carregando...</span>}
          {deck === null && <span className="text-text-muted">sem deck</span>}
          {deck && (
            <>
              <Badge color={DECK_STATUS_BADGE[deck.validationStatus]}>{deck.validationStatus}</Badge>
              <button onClick={() => setExpanded((v) => !v)} className="text-brand-cyan hover:underline">
                {expanded ? 'ocultar' : 'ver'}
              </button>
            </>
          )}
          <button onClick={onRemove} className="text-brand-red hover:underline">
            Remover
          </button>
        </span>
      </div>

      {expanded && deck && (
        <div className="mt-2 space-y-2 rounded border border-panel-border bg-ink/30 p-2">
          <div className="flex gap-2">
            <img src={deck.mainExtraImage} alt="Deck principal + extra" className="h-24 w-auto rounded border border-panel-border" />
            <img src={deck.sideImage} alt="Side deck" className="h-24 w-auto rounded border border-panel-border" />
          </div>
          <DeckPreview decodedCards={deck.decodedCards} />
          <div className="flex gap-2">
            <button
              onClick={() => runAction('approve')}
              className="rounded border border-brand-green px-2 py-1 text-xs text-brand-green transition hover:bg-brand-green/10"
            >
              Aprovar
            </button>
            <button
              onClick={() => runAction('reject')}
              className="rounded border border-brand-red px-2 py-1 text-xs text-brand-red transition hover:bg-brand-red/10"
            >
              Rejeitar
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
