import { useEffect, useState } from 'react'
import { apiRequest } from './api'

const API_URL = import.meta.env.VITE_API_URL as string

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Entrar com Google',
  discord: 'Entrar com Discord',
}

export function OAuthButtons() {
  const [providers, setProviders] = useState<Record<string, boolean>>({})

  useEffect(() => {
    apiRequest<Record<string, boolean>>('/auth/oauth/providers')
      .then(setProviders)
      .catch(() => setProviders({}))
  }, [])

  const enabled = Object.entries(providers).filter(([, isEnabled]) => isEnabled)
  if (enabled.length === 0) return null

  return (
    <div className="mt-4 space-y-2 border-t border-panel-border pt-4">
      {enabled.map(([provider]) => (
        <a
          key={provider}
          href={`${API_URL}/auth/oauth/${provider}`}
          className="block w-full rounded border border-panel-border py-2 text-center text-sm text-text transition hover:border-brand-pink hover:text-brand-pink"
        >
          {PROVIDER_LABELS[provider] ?? `Entrar com ${provider}`}
        </a>
      ))}
    </div>
  )
}
