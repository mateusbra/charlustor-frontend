import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ProfilePage } from './ProfilePage'
import { AuthProvider } from '../auth/AuthContext'
import * as api from '../auth/api'

vi.mock('../auth/api', async () => {
  const actual = await vi.importActual<typeof api>('../auth/api')
  return { ...actual, apiRequest: vi.fn() }
})

const PROFILE = {
  id: 'user-1',
  email: 'a@a.com',
  nickname: 'OldNick',
  masterDuelFriendCode: '123456789012',
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.mocked(api.apiRequest).mockReset()
  })

  it('loads the current profile and prefills the form', async () => {
    vi.mocked(api.apiRequest)
      .mockResolvedValueOnce({ accessToken: 'token', user: { id: 'user-1', email: 'a@a.com', role: 'PLAYER' } }) // restoreSession
      .mockResolvedValueOnce(PROFILE) // GET /users/me

    render(
      <MemoryRouter>
        <AuthProvider>
          <ProfilePage />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByDisplayValue('OldNick')).toBeInTheDocument()
    expect(screen.getByDisplayValue('123456789012')).toBeInTheDocument()
  })

  it('submits the updated profile on save', async () => {
    vi.mocked(api.apiRequest)
      .mockResolvedValueOnce({ accessToken: 'token', user: { id: 'user-1', email: 'a@a.com', role: 'PLAYER' } })
      .mockResolvedValueOnce(PROFILE)
      .mockResolvedValueOnce({ ...PROFILE, nickname: 'NewNick' })

    render(
      <MemoryRouter>
        <AuthProvider>
          <ProfilePage />
        </AuthProvider>
      </MemoryRouter>,
    )

    const nicknameInput = await screen.findByDisplayValue('OldNick')
    fireEvent.change(nicknameInput, { target: { value: 'NewNick' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() =>
      expect(api.apiRequest).toHaveBeenCalledWith(
        '/users/me',
        expect.objectContaining({ method: 'PATCH', token: 'token' }),
      ),
    )
  })
})
