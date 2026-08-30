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
export type RoundPhase = 'SWISS' | 'TOP_CUT'
export type MatchResultStatus = 'PENDING' | 'CONFIRMED' | 'DISPUTED'
export type MatchParticipant = { id: string; user: { id: string; nickname: string | null } }
export type Match = {
  id: string
  roundId: string
  participantAId: string
  participantBId: string | null
  reportedScoreA: string | null
  reportedScoreB: string | null
  resultStatus: MatchResultStatus
  confirmedScore: string | null
  participantA: MatchParticipant
  participantB: MatchParticipant | null
}
export type Round = {
  id: string
  tournamentId: string
  number: number
  status: RoundStatus
  phase: RoundPhase
  matches: Match[]
}

export type StandingRow = {
  position: number
  participantId: string
  nickname: string | null
  points: number
  wins: number
  losses: number
  buchholz: number
}

export type Season = {
  id: string
  name: string
  startDate: string
  endDate: string | null
  isActive: boolean
}

export type SeasonRankingRow = {
  position: number
  userId: string
  nickname: string | null
  points: number
  tournamentsPlayed: number
}

export const FORMAT_LABELS: Record<TournamentFormat, string> = {
  SWISS: 'Suíço',
  SINGLE_ELIM: 'Eliminação simples',
  DOUBLE_ELIM: 'Eliminação dupla',
  SWISS_TOP_CUT: 'Suíço + Top Cut',
}
