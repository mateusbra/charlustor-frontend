import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../auth/AuthLayout'
import { apiRequest } from '../auth/api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      await apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
    } finally {
      setSubmitting(false)
      setSent(true)
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Verifique seu e-mail">
        <p className="text-sm text-gray-600">
          Se existir uma conta para <span className="font-medium">{email}</span>, enviamos um link de
          redefinição de senha.
        </p>
        <Link to="/login" className="mt-4 block text-sm text-gray-500">
          Voltar para o login
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Esqueci a senha">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-gray-900 py-2 text-sm text-white disabled:opacity-50"
        >
          Enviar link de redefinição
        </button>
      </form>
      <Link to="/login" className="mt-4 block text-sm text-gray-500">
        Voltar para o login
      </Link>
    </AuthLayout>
  )
}
