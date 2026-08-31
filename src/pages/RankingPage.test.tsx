import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { RankingPage } from './RankingPage'
import { AuthProvider } from '../auth/AuthContext'
import * as api from '../auth/api'

vi.mock('../auth/api', async () => {
  const actual = await vi.importActual<typeof api>('../auth/api')
  return { ...actual, apiRequest: vi.fn() }
})

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <RankingPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('RankingPage', () => {
  beforeEach(() => {
    vi.mocked(api.apiRequest).mockReset()
  })

  it('shows a message when there is no active season', async () => {
    vi.mocked(api.apiRequest).mockImplementation((path: string) => {
      if (path === '/auth/refresh') return Promise.reject(new api.ApiError(401, 'no session'))
      if (path === '/seasons/active') return Promise.resolve(null)
      return Promise.resolve(undefined)
    })

    renderPage()

    expect(await screen.findByText('Nenhuma temporada ativa no momento.')).toBeInTheDocument()
  })

  it('renders the ranking table for the active season', async () => {
    vi.mocked(api.apiRequest).mockImplementation((path: string) => {
      if (path === '/auth/refresh') return Promise.reject(new api.ApiError(401, 'no session'))
      if (path === '/seasons/active') return Promise.resolve({ id: 's-1', name: 'Temporada 1', startDate: '2026-01-01', endDate: null, isActive: true })
      if (path === '/seasons/s-1/ranking') {
        return Promise.resolve([
          { position: 1, userId: 'u1', nickname: 'Alice', points: 17, tournamentsPlayed: 2 },
          { position: 2, userId: 'u2', nickname: 'Bob', points: 10, tournamentsPlayed: 1 },
        ])
      }
      return Promise.resolve(undefined)
    })

    renderPage()

    expect(await screen.findByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('17')).toBeInTheDocument()
  })
})
