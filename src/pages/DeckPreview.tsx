import type { DecodedDeck } from './tournamentTypes'

function CardList({ title, cards }: { title: string; cards: DecodedDeck['main'] }) {
  if (cards.length === 0) return null
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">
        {title} ({cards.reduce((sum, c) => sum + c.quantity, 0)})
      </p>
      <ul className="text-xs text-gray-700">
        {cards.map((c, i) => (
          <li key={`${c.name}-${i}`}>
            {c.quantity}x {c.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DeckPreview({ decodedCards }: { decodedCards: DecodedDeck }) {
  return (
    <div className="space-y-2">
      <CardList title="Main" cards={decodedCards.main} />
      <CardList title="Extra" cards={decodedCards.extra} />
      <CardList title="Side" cards={decodedCards.side} />
    </div>
  )
}
