import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { LoginPage } from './LoginPage'
import { AuthProvider } from '../auth/AuthContext'
import * as api from '../auth/api'

vi.mock('../auth/api', async () => {
  const actual = await vi.importActual<typeof api>('../auth/api')
  return { ...actual, apiRequest: vi.fn() }
})

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(api.apiRequest).mockReset()
    // Session restore on mount always hits /auth/refresh — reject it so tests start logged out.
    vi.mocked(api.apiRequest).mockRejectedValue(new api.ApiError(401, 'no session'))
  })

  it('renders the e-mail and password fields', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument()
  })

  it('calls the login endpoint on submit', async () => {
    vi.mocked(api.apiRequest)
      .mockRejectedValueOnce(new api.ApiError(401, 'no session')) // initial restoreSession
      .mockResolvedValueOnce({ accessToken: 'token', user: { id: '1', email: 'a@a.com', role: 'PLAYER' } })

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'a@a.com' } })
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() =>
      expect(api.apiRequest).toHaveBeenCalledWith(
        '/auth/login',
        expect.objectContaining({ method: 'POST' }),
      ),
    )
  })
})
