import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StandingsTable } from './StandingsTable'
import type { StandingRow } from './tournamentTypes'

describe('StandingsTable', () => {
  it('shows an empty-state message with no standings', () => {
    render(<StandingsTable standings={[]} />)
    expect(screen.getByText('Sem partidas confirmadas ainda.')).toBeInTheDocument()
  })

  it('renders rows in the given order with points and record', () => {
    const standings: StandingRow[] = [
      { position: 1, participantId: 'p-1', nickname: 'Leader', points: 6, wins: 2, losses: 0, buchholz: 3 },
      { position: 2, participantId: 'p-2', nickname: 'Runner-up', points: 3, wins: 1, losses: 1, buchholz: 6 },
    ]
    render(<StandingsTable standings={standings} />)

    expect(screen.getByText('Leader')).toBeInTheDocument()
    expect(screen.getByText('Runner-up')).toBeInTheDocument()
    expect(screen.getByText('1-1')).toBeInTheDocument()
  })
})
