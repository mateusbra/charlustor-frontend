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
        <p className="text-sm text-text-muted">
          Se existir uma conta para <span className="font-medium text-text">{email}</span>, enviamos um link de
          redefinição de senha.
        </p>
        <Link to="/login" className="mt-4 block text-sm text-text-muted hover:text-brand-pink">
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
          className="w-full rounded border border-panel-border bg-ink/40 px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-brand-pink focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-gradient-to-r from-brand-pink to-brand-purple py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          Enviar link de redefinição
        </button>
      </form>
      <Link to="/login" className="mt-4 block text-sm text-text-muted hover:text-brand-pink">
        Voltar para o login
      </Link>
    </AuthLayout>
  )
}
