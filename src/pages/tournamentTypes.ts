export type TournamentFormat = 'SWISS' | 'SINGLE_ELIM' | 'DOUBLE_ELIM' | 'SWISS_TOP_CUT'
export type TournamentStatus = 'DRAFT' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'IN_PROGRESS' | 'COMPLETED'
export type ParticipantStatus = 'REGISTERED' | 'WITHDRAWN' | 'DISQUALIFIED'

export type Tournament = {
  id: string
  name: string
  format: TournamentFormat
  roundsCount: number | null
  topCutSize: number | null
  scheduledAt: string
  status: TournamentStatus
  organizerId: string
}

export type Participant = {
  id: string
  tournamentId: string
  userId: string
  status: ParticipantStatus
  registeredAt: string
  user: { id: string; nickname: string | null }
}

export type DeckStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type DecodedCard = { id: number | null; name: string; quantity: number }
export type DecodedDeck = { main: DecodedCard[]; extra: DecodedCard[]; side: DecodedCard[] }

export type Deck = {
  id: string
  participantId: string
  mainExtraImage: string
  sideImage: string
  decodedCards: DecodedDeck
  validationStatus: DeckStatus
  submittedAt: string
}

export type RoundStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
export type Round = {
  id: string
  tournamentId: string
  number: number
  status: RoundStatus
  _count: { matches: number }
}

export const FORMAT_LABELS: Record<TournamentFormat, string> = {
  SWISS: 'Suíço',
  SINGLE_ELIM: 'Eliminação simples',
  DOUBLE_ELIM: 'Eliminação dupla',
  SWISS_TOP_CUT: 'Suíço + Top Cut',
}
