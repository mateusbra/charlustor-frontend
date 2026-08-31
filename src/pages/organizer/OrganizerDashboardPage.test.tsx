import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { OrganizerDashboardPage } from './OrganizerDashboardPage'
import * as api from '../../auth/api'
import * as authContext from '../../auth/AuthContext'

vi.mock('../../auth/api', async () => {
  const actual = await vi.importActual<typeof api>('../../auth/api')
  return { ...actual, apiRequest: vi.fn() }
})

vi.mock('../../auth/AuthContext', async () => {
  const actual = await vi.importActual<typeof authContext>('../../auth/AuthContext')
  return { ...actual, useAuth: vi.fn() }
})

describe('OrganizerDashboardPage', () => {
  beforeEach(() => {
    vi.mocked(api.apiRequest).mockReset()
    vi.mocked(authContext.useAuth).mockReturnValue({
      accessToken: 'token-123',
      user: { id: 'organizer-1', email: 'org@example.com', role: 'ORGANIZER' },
    } as never)
  })

  it('shows a message when the organizer has no tournaments', async () => {
    vi.mocked(api.apiRequest).mockResolvedValue([])

    render(
      <MemoryRouter>
        <OrganizerDashboardPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Você ainda não criou nenhum torneio.')).toBeInTheDocument()
  })

  it('renders a card per tournament with pending decks and disputed matches counts', async () => {
    vi.mocked(api.apiRequest).mockResolvedValue([
      {
        id: 't-1',
        name: 'Semanal 1',
        format: 'SWISS',
        status: 'IN_PROGRESS',
        scheduledAt: '2026-01-01T18:00:00.000Z',
        pendingDecksCount: 2,
        disputedMatchesCount: 1,
      },
      {
        id: 't-2',
        name: 'Semanal 2',
        format: 'SWISS',
        status: 'DRAFT',
        scheduledAt: '2026-01-08T18:00:00.000Z',
        pendingDecksCount: 0,
        disputedMatchesCount: 0,
      },
    ])

    render(
      <MemoryRouter>
        <OrganizerDashboardPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Semanal 1/)).toBeInTheDocument()
    expect(screen.getByText('2 deck(s) pendente(s)')).toBeInTheDocument()
    expect(screen.getByText('1 partida(s) em disputa')).toBeInTheDocument()
    expect(screen.getByText(/Semanal 2/)).toBeInTheDocument()
  })
})
