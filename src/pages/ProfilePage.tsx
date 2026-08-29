import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { AuthLayout } from '../auth/AuthLayout'
import { apiRequest, ApiError } from '../auth/api'

type Profile = {
  id: string
  email: string
  nickname: string | null
  masterDuelFriendCode: string | null
}

export function ProfilePage() {
  const { accessToken } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [nickname, setNickname] = useState('')
  const [friendCode, setFriendCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!accessToken) return
    apiRequest<Profile>('/users/me', { token: accessToken }).then((data) => {
      setProfile(data)
      setNickname(data.nickname ?? '')
      setFriendCode(data.masterDuelFriendCode ?? '')
    })
  }, [accessToken])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(false)
    setSubmitting(true)
    try {
      const updated = await apiRequest<Profile>('/users/me', {
        method: 'PATCH',
        token: accessToken ?? undefined,
        body: JSON.stringify({ nickname, masterDuelFriendCode: friendCode }),
      })
      setProfile(updated)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar o perfil')
    } finally {
      setSubmitting(false)
    }
  }

  if (!profile) {
    return (
      <AuthLayout title="Meu perfil">
        <p className="text-sm text-gray-500">Carregando...</p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Meu perfil">
      <p className="mb-4 text-sm text-gray-500">{profile.email}</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Nickname</label>
          <input
            type="text"
            placeholder="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            minLength={3}
            maxLength={20}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Friend Code (Master Duel)</label>
          <input
            type="text"
            placeholder="Friend Code"
            value={friendCode}
            onChange={(e) => setFriendCode(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">Perfil salvo.</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-gray-900 py-2 text-sm text-white disabled:opacity-50"
        >
          Salvar
        </button>
      </form>
    </AuthLayout>
  )
}
