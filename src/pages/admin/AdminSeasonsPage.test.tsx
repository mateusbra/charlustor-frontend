import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AdminSeasonsPage } from './AdminSeasonsPage'
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

describe('AdminSeasonsPage', () => {
  beforeEach(() => {
    vi.mocked(api.apiRequest).mockReset()
    vi.mocked(authContext.useAuth).mockReturnValue({
      accessToken: 'token-123',
      user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN' },
    } as never)
  })

  it('lists seasons and shows activate/close depending on isActive', async () => {
    vi.mocked(api.apiRequest).mockResolvedValue([
      { id: 's-1', name: 'Temporada 1', startDate: '2026-01-01', endDate: null, isActive: true },
      { id: 's-2', name: 'Temporada 2', startDate: '2026-06-01', endDate: null, isActive: false },
    ])

    render(<AdminSeasonsPage />)

    expect(await screen.findByText(/Temporada 1/)).toBeInTheDocument()
    expect(screen.getByText('Encerrar')).toBeInTheDocument()
    expect(screen.getByText('Ativar')).toBeInTheDocument()
  })

  it('clicking Ativar calls the activate endpoint', async () => {
    vi.mocked(api.apiRequest).mockImplementation((path: string) => {
      if (path === '/admin/seasons') return Promise.resolve([
        { id: 's-2', name: 'Temporada 2', startDate: '2026-06-01', endDate: null, isActive: false },
      ])
      return Promise.resolve(undefined)
    })

    render(<AdminSeasonsPage />)

    fireEvent.click(await screen.findByText('Ativar'))

    await waitFor(() =>
      expect(api.apiRequest).toHaveBeenCalledWith('/admin/seasons/s-2/activate', expect.objectContaining({ method: 'PATCH' })),
    )
  })
})
