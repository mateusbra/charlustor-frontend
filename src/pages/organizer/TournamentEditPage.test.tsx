import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TournamentEditPage } from './TournamentEditPage'
import { AuthProvider } from '../../auth/AuthContext'
import * as api from '../../auth/api'

vi.mock('../../auth/api', async () => {
  const actual = await vi.importActual<typeof api>('../../auth/api')
  return { ...actual, apiRequest: vi.fn() }
})

const TOURNAMENT = {
  id: 't-1',
  name: 'Weekly #1',
  format: 'SWISS' as const,
  roundsCount: 4,
  topCutSize: null,
  scheduledAt: '2026-09-05T20:00:00.000Z',
  status: 'REGISTRATION_OPEN' as const,
  organizerId: 'org-1',
}

function renderPage() {
  vi.mocked(api.apiRequest).mockImplementation((path: string) => {
    if (path === '/auth/refresh') return Promise.reject(new api.ApiError(401, 'no session'))
    if (path === '/tournaments/t-1') return Promise.resolve(TOURNAMENT)
    if (path === '/tournaments/t-1/participants') return Promise.resolve([])
    return Promise.resolve(undefined)
  })

  return render(
    <MemoryRouter initialEntries={['/organizer/tournaments/t-1/edit']}>
      <AuthProvider>
        <Routes>
          <Route path="/organizer/tournaments/:id/edit" element={<TournamentEditPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('TournamentEditPage — tournament engine actions', () => {
  beforeEach(() => {
    vi.mocked(api.apiRequest).mockReset()
  })

  it('shows "Iniciar torneio" while registration is open', async () => {
    renderPage()
    expect(await screen.findByRole('button', { name: 'Iniciar torneio' })).toBeInTheDocument()
  })

  it('shows the list of pending participants when start is blocked', async () => {
    renderPage()
    const startButton = await screen.findByRole('button', { name: 'Iniciar torneio' })

    vi.mocked(api.apiRequest).mockImplementationOnce(() =>
      Promise.reject(
        new api.ApiError(400, 'Some participants do not have an approved deck yet', {
          pendingParticipants: ['NoDeckPlayer', 'PendingPlayer'],
        }),
      ),
    )

    fireEvent.click(startButton)

    expect(await screen.findByText('NoDeckPlayer')).toBeInTheDocument()
    expect(await screen.findByText('PendingPlayer')).toBeInTheDocument()
  })

  it('shows "Avançar rodada" and "Encerrar torneio" while in progress', async () => {
    vi.mocked(api.apiRequest).mockImplementation((path: string) => {
      if (path === '/auth/refresh') return Promise.reject(new api.ApiError(401, 'no session'))
      if (path === '/tournaments/t-1') return Promise.resolve({ ...TOURNAMENT, status: 'IN_PROGRESS' })
      if (path === '/tournaments/t-1/participants') return Promise.resolve([])
      return Promise.resolve(undefined)
    })

    render(
      <MemoryRouter initialEntries={['/organizer/tournaments/t-1/edit']}>
        <AuthProvider>
          <Routes>
            <Route path="/organizer/tournaments/:id/edit" element={<TournamentEditPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('button', { name: 'Avançar rodada' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Encerrar torneio' })).toBeInTheDocument()
  })
})
