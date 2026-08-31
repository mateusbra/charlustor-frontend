import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AuthLayout } from '../auth/AuthLayout'
import { OAuthButtons } from '../auth/OAuthButtons'
import { ApiError } from '../auth/api'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar a conta')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Criar conta">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded border border-panel-border bg-ink/40 px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-brand-pink focus:outline-none"
        />
        <input
          type="password"
          placeholder="Senha (mín. 8 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full rounded border border-panel-border bg-ink/40 px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-brand-pink focus:outline-none"
        />
        {error && <p className="text-sm text-brand-red">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-gradient-to-r from-brand-pink to-brand-purple py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          Criar conta
        </button>
      </form>
      <div className="mt-4 text-sm text-text-muted">
        <Link to="/login">Já tenho conta</Link>
      </div>
      <OAuthButtons />
    </AuthLayout>
  )
}
