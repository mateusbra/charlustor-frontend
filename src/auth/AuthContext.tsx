import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { apiRequest, ApiError } from './api'

export type User = { id: string; email: string; role: string }

type Session = { accessToken: string; user: User }

type AuthContextValue = {
  user: User | null
  accessToken: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  restoreSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const applySession = (session: Session) => {
    setUser(session.user)
    setAccessToken(session.accessToken)
  }

  const clearSession = () => {
    setUser(null)
    setAccessToken(null)
  }

  // Coalesces concurrent callers (e.g. React StrictMode's double effect
  // invocation in dev) into a single /auth/refresh call — the backend treats
  // a reused refresh token as session theft and revokes the whole session,
  // so firing two requests with the same cookie would lock the user out.
  const inFlightRefresh = useRef<Promise<boolean> | null>(null)

  const restoreSession = useCallback(() => {
    if (inFlightRefresh.current) return inFlightRefresh.current

    const promise = (async () => {
      try {
        const session = await apiRequest<Session>('/auth/refresh', { method: 'POST' })
        applySession(session)
        return true
      } catch {
        clearSession()
        return false
      } finally {
        setLoading(false)
        inFlightRefresh.current = null
      }
    })()

    inFlightRefresh.current = promise
    return promise
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  const login = async (email: string, password: string) => {
    const session = await apiRequest<Session>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    applySession(session)
  }

  const register = async (email: string, password: string) => {
    const session = await apiRequest<Session>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    applySession(session)
  }

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } catch (error) {
      if (!(error instanceof ApiError)) throw error
    }
    clearSession()
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout, restoreSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
