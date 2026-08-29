import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ReportScoreForm } from './ReportScoreForm'
import { AuthProvider } from '../auth/AuthContext'
import * as api from '../auth/api'
import type { Match } from './tournamentTypes'

vi.mock('../auth/api', async () => {
  const actual = await vi.importActual<typeof api>('../auth/api')
  return { ...actual, apiRequest: vi.fn() }
})

function baseMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: 'm-1',
    roundId: 'r-1',
    participantAId: 'p-a',
    participantBId: 'p-b',
    reportedScoreA: null,
    reportedScoreB: null,
    resultStatus: 'PENDING',
    confirmedScore: null,
    participantA: { id: 'p-a', user: { id: 'user-1', nickname: 'Me' } },
    participantB: { id: 'p-b', user: { id: 'user-2', nickname: 'Opponent' } },
    ...overrides,
  }
}

function renderForm(match: Match) {
  vi.mocked(api.apiRequest).mockImplementation((path: string) => {
    if (path === '/auth/refresh') return Promise.reject(new api.ApiError(401, 'no session'))
    return Promise.resolve(undefined)
  })

  return render(
    <MemoryRouter>
      <AuthProvider>
        <ReportScoreForm match={match} myUserId="user-1" onReported={vi.fn()} />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('ReportScoreForm', () => {
  beforeEach(() => {
    vi.mocked(api.apiRequest).mockReset()
  })

  it('shows a form when nothing has been reported yet', () => {
    renderForm(baseMatch())
    expect(screen.getByPlaceholderText('Ex.: 2-1')).toBeInTheDocument()
  })

  it('shows a waiting message once I have reported', () => {
    renderForm(baseMatch({ reportedScoreA: '2-1' }))
    expect(screen.getByText('Você reportou 2-1. Aguardando o adversário.')).toBeInTheDocument()
  })

  it('shows the confirmed score when resultStatus is CONFIRMED', () => {
    renderForm(baseMatch({ resultStatus: 'CONFIRMED', confirmedScore: '2-1' }))
    expect(screen.getByText('Confirmado: 2-1')).toBeInTheDocument()
  })

  it('shows a dispute message when resultStatus is DISPUTED', () => {
    renderForm(baseMatch({ resultStatus: 'DISPUTED' }))
    expect(screen.getByText('Placar em disputa — aguardando o organizador resolver.')).toBeInTheDocument()
  })

  it('submits the score to /matches/:id/report', async () => {
    renderForm(baseMatch())
    fireEvent.change(screen.getByPlaceholderText('Ex.: 2-1'), { target: { value: '2-0' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reportar' }))

    await waitFor(() =>
      expect(api.apiRequest).toHaveBeenCalledWith(
        '/matches/m-1/report',
        expect.objectContaining({ method: 'POST' }),
      ),
    )
  })
})
