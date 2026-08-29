export type TournamentFormat = 'SWISS' | 'SINGLE_ELIM' | 'DOUBLE_ELIM' | 'SWISS_TOP_CUT'
export type TournamentStatus = 'DRAFT' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'IN_PROGRESS' | 'COMPLETED'

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

export const FORMAT_LABELS: Record<TournamentFormat, string> = {
  SWISS: 'Suíço',
  SINGLE_ELIM: 'Eliminação simples',
  DOUBLE_ELIM: 'Eliminação dupla',
  SWISS_TOP_CUT: 'Suíço + Top Cut',
}
