import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { HomePage } from './HomePage'
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
        <HomePage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(api.apiRequest).mockReset()
  })

  it('shows tournaments with open registration or in progress, sorted by date', async () => {
    vi.mocked(api.apiRequest).mockImplementation((path: string) => {
      if (path === '/auth/refresh') return Promise.reject(new api.ApiError(401, 'no session'))
      if (path === '/tournaments') {
        return Promise.resolve([
          { id: 't-1', name: 'Semanal 2', format: 'SWISS', roundsCount: 4, topCutSize: null, scheduledAt: '2026-09-10T20:00:00.000Z', status: 'REGISTRATION_OPEN', organizerId: 'o-1' },
          { id: 't-2', name: 'Semanal 1', format: 'SWISS', roundsCount: 4, topCutSize: null, scheduledAt: '2026-09-01T20:00:00.000Z', status: 'IN_PROGRESS', organizerId: 'o-1' },
          { id: 't-3', name: 'Rascunho', format: 'SWISS', roundsCount: 4, topCutSize: null, scheduledAt: '2026-09-05T20:00:00.000Z', status: 'DRAFT', organizerId: 'o-1' },
        ])
      }
      if (path === '/youtube/videos') return Promise.resolve([])
      return Promise.resolve(undefined)
    })

    renderPage()

    const names = await screen.findAllByRole('heading', { level: 3 })
    expect(names.map((n) => n.textContent)).toEqual(['Semanal 1', 'Semanal 2'])
    expect(screen.queryByText('Rascunho')).not.toBeInTheDocument()
  })

  it('shows recent YouTube videos as links', async () => {
    vi.mocked(api.apiRequest).mockImplementation((path: string) => {
      if (path === '/auth/refresh') return Promise.reject(new api.ApiError(401, 'no session'))
      if (path === '/tournaments') return Promise.resolve([])
      if (path === '/youtube/videos') {
        return Promise.resolve([
          { id: 'v1', title: 'Vídeo mais recente', url: 'https://www.youtube.com/watch?v=v1', thumbnailUrl: 'https://i.ytimg.com/vi/v1/hqdefault.jpg', publishedAt: '2026-08-01T00:00:00.000Z' },
        ])
      }
      return Promise.resolve(undefined)
    })

    renderPage()

    const link = await screen.findByRole('link', { name: /Vídeo mais recente/ })
    expect(link).toHaveAttribute('href', 'https://www.youtube.com/watch?v=v1')
  })

  it('shows an empty state when there are no highlighted tournaments', async () => {
    vi.mocked(api.apiRequest).mockImplementation((path: string) => {
      if (path === '/auth/refresh') return Promise.reject(new api.ApiError(401, 'no session'))
      if (path === '/tournaments') return Promise.resolve([])
      if (path === '/youtube/videos') return Promise.resolve([])
      return Promise.resolve(undefined)
    })

    renderPage()

    expect(await screen.findByText('Nenhum torneio com inscrição aberta no momento.')).toBeInTheDocument()
  })
})
