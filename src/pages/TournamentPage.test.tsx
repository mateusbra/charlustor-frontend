import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TournamentPage } from './TournamentPage'
import { AuthProvider } from '../auth/AuthContext'
import * as api from '../auth/api'

vi.mock('../auth/api', async () => {
  const actual = await vi.importActual<typeof api>('../auth/api')
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

function renderPage(participants: unknown[]) {
  vi.mocked(api.apiRequest).mockImplementation((path: string) => {
    if (path === '/auth/refresh') {
      return Promise.resolve({ accessToken: 'token', user: { id: 'user-1', email: 'a@a.com', role: 'PLAYER' } })
    }
    if (path === '/tournaments/t-1') return Promise.resolve(TOURNAMENT)
    if (path === '/tournaments/t-1/participants') return Promise.resolve(participants)
    return Promise.resolve(undefined)
  })

  return render(
    <MemoryRouter initialEntries={['/tournaments/t-1']}>
      <AuthProvider>
        <Routes>
          <Route path="/tournaments/:id" element={<TournamentPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('TournamentPage', () => {
  beforeEach(() => {
    vi.mocked(api.apiRequest).mockReset()
  })

  it('shows "Inscrever-se" when the logged-in user is not registered', async () => {
    renderPage([])
    expect(await screen.findByRole('button', { name: 'Inscrever-se' })).toBeInTheDocument()
  })

  it('shows "Sair do torneio" when the logged-in user is already registered', async () => {
    renderPage([{ id: 'p-1', user: { id: 'user-1', nickname: 'Duelist' }, status: 'REGISTERED' }])
    expect(await screen.findByRole('button', { name: 'Sair do torneio' })).toBeInTheDocument()
  })

  it('calls /register when the button is clicked while unregistered', async () => {
    renderPage([])
    const button = await screen.findByRole('button', { name: 'Inscrever-se' })
    fireEvent.click(button)

    await waitFor(() =>
      expect(api.apiRequest).toHaveBeenCalledWith(
        '/tournaments/t-1/register',
        expect.objectContaining({ method: 'POST' }),
      ),
    )
  })
})
