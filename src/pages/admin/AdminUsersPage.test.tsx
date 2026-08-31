import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AdminUsersPage } from './AdminUsersPage'
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

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.mocked(api.apiRequest).mockReset()
    vi.mocked(authContext.useAuth).mockReturnValue({
      accessToken: 'token-123',
      user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN' },
    } as never)
  })

  it('lists users with their current role', async () => {
    vi.mocked(api.apiRequest).mockResolvedValue([
      { id: 'u-1', email: 'alice@example.com', nickname: 'Alice', role: 'PLAYER', createdAt: '2026-01-01' },
    ])

    render(<AdminUsersPage />)

    expect(await screen.findByText(/Alice/)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveValue('PLAYER')
  })

  it('changing the role select sends a PATCH request', async () => {
    vi.mocked(api.apiRequest).mockImplementation((path: string) => {
      if (path === '/admin/users') return Promise.resolve([
        { id: 'u-1', email: 'alice@example.com', nickname: 'Alice', role: 'PLAYER', createdAt: '2026-01-01' },
      ])
      return Promise.resolve(undefined)
    })

    render(<AdminUsersPage />)

    const select = await screen.findByRole('combobox')
    fireEvent.change(select, { target: { value: 'ORGANIZER' } })

    await waitFor(() =>
      expect(api.apiRequest).toHaveBeenCalledWith(
        '/admin/users/u-1/role',
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ role: 'ORGANIZER' }) }),
      ),
    )
  })
})
