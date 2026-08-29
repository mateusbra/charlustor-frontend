import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'
import * as api from '../auth/api'

vi.mock('../auth/api', async () => {
  const actual = await vi.importActual<typeof api>('../auth/api')
  return { ...actual, apiRequest: vi.fn() }
})

function countRefreshCalls() {
  return vi.mocked(api.apiRequest).mock.calls.filter(([path]) => path === '/auth/refresh').length
}

describe('AuthProvider — restoreSession', () => {
  beforeEach(() => {
    vi.mocked(api.apiRequest).mockReset()
    vi.mocked(api.apiRequest).mockResolvedValue({
      accessToken: 'token',
      user: { id: '1', email: 'a@a.com', role: 'PLAYER' },
    })
  })

  // Regression test: React StrictMode double-invokes effects in dev, which
  // used to fire two /auth/refresh calls with the same cookie. The backend
  // treats a reused (already-rotated) refresh token as session theft and
  // revokes the whole session — so the second call locked the user out even
  // though the first one had just succeeded.
  it('coalesces concurrent restoreSession calls into a single /auth/refresh request', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    const first = result.current.restoreSession()
    const second = result.current.restoreSession()
    await Promise.all([first, second])

    expect(countRefreshCalls()).toBe(1)
  })

  it('allows a new /auth/refresh call once the previous one has settled', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await waitFor(() => expect(result.current.loading).toBe(false))

    await result.current.restoreSession()

    expect(countRefreshCalls()).toBe(2)
  })
})
