import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { PrivateRoute } from './PrivateRoute'
import * as AuthContextModule from './AuthContext'

function renderWithAuth(user: AuthContextModule.User | null, loading = false, requiredRole?: string) {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
    user,
    accessToken: null,
    loading,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    restoreSession: vi.fn(),
  })

  return render(
    <MemoryRouter initialEntries={['/private']}>
      <Routes>
        <Route
          path="/private"
          element={<PrivateRoute requiredRole={requiredRole}>Conteúdo protegido</PrivateRoute>}
        />
        <Route path="/login" element={<p>Página de login</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PrivateRoute', () => {
  it('redirects to /login when there is no user', () => {
    renderWithAuth(null)
    expect(screen.getByText('Página de login')).toBeInTheDocument()
  })

  it('renders the protected content when a user is present', () => {
    renderWithAuth({ id: '1', email: 'a@a.com', role: 'PLAYER' })
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument()
  })

  it('shows a loading state while the session is being restored', () => {
    renderWithAuth(null, true)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('blocks a user whose role does not match requiredRole', () => {
    renderWithAuth({ id: '1', email: 'a@a.com', role: 'PLAYER' }, false, 'ORGANIZER')
    expect(screen.getByText('Você não tem permissão para acessar esta página.')).toBeInTheDocument()
  })

  it('allows a user whose role matches requiredRole', () => {
    renderWithAuth({ id: '1', email: 'a@a.com', role: 'ORGANIZER' }, false, 'ORGANIZER')
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument()
  })

  it('allows an ADMIN through any requiredRole', () => {
    renderWithAuth({ id: '1', email: 'a@a.com', role: 'ADMIN' }, false, 'ORGANIZER')
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument()
  })
})
