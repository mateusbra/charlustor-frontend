import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { apiRequest, ApiError } from '../auth/api'
import { DeckPreview } from './DeckPreview'
import type { Deck } from './tournamentTypes'

export function DeckSubmitForm({ participantId, onSubmitted }: { participantId: string; onSubmitted: (deck: Deck) => void }) {
  const { accessToken } = useAuth()
  const [mainExtra, setMainExtra] = useState<File | null>(null)
  const [side, setSide] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<Deck | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!mainExtra || !side) {
      setError('Envie as duas imagens (deck principal+extra e side deck)')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('mainExtra', mainExtra)
      formData.append('side', side)
      const deck = await apiRequest<Deck>(`/participants/${participantId}/deck`, {
        method: 'PUT',
        token: accessToken ?? undefined,
        body: formData,
      })
      setResult(deck)
      onSubmitted(deck)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível enviar o deck')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Captura do deck (principal + extra)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setMainExtra(e.target.files?.[0] ?? null)}
            className="w-full text-xs"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Captura do side deck</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSide(e.target.files?.[0] ?? null)}
            className="w-full text-xs"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-gray-900 py-2 text-sm text-white disabled:opacity-50"
        >
          {submitting ? 'Reconhecendo cartas...' : 'Enviar deck'}
        </button>
      </form>

      {result && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="mb-2 text-xs text-gray-500">Status: {result.validationStatus}</p>
          <DeckPreview decodedCards={result.decodedCards} />
        </div>
      )}
    </div>
  )
}
