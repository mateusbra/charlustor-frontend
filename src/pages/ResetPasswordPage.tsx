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
        <p className="text-sm text-gray-600">
          Este link de redefinição de senha está incompleto ou expirado.
        </p>
        <Link to="/forgot-password" className="mt-4 block text-sm text-gray-500">
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
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-gray-900 py-2 text-sm text-white disabled:opacity-50"
        >
          Redefinir senha
        </button>
      </form>
    </AuthLayout>
  )
}
