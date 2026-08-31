import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '../auth/AuthLayout'
import { apiRequest, ApiError } from '../auth/api'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) })
      navigate('/login')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível redefinir a senha')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Link inválido">
        <p className="text-sm text-text-muted">
          Este link de redefinição de senha está incompleto ou expirado.
        </p>
        <Link to="/forgot-password" className="mt-4 block text-sm text-text-muted hover:text-brand-pink">
          Solicitar um novo link
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Redefinir senha">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          placeholder="Nova senha (mín. 8 caracteres)"
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
          Redefinir senha
        </button>
      </form>
    </AuthLayout>
  )
}
