import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AuthLayout } from '../auth/AuthLayout'
import { apiRequest, ApiError } from '../auth/api'

type PublicProfile = { id: string; nickname: string | null }

export function PublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    apiRequest<PublicProfile>(`/users/${id}`)
      .then(setProfile)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true)
      })
  }, [id])

  if (notFound) {
    return (
      <AuthLayout title="Jogador não encontrado">
        <p className="text-sm text-text-muted">Não existe nenhum jogador com esse identificador.</p>
      </AuthLayout>
    )
  }

  if (!profile) {
    return (
      <AuthLayout title="Perfil">
        <p className="text-sm text-text-muted">Carregando...</p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title={profile.nickname ?? 'Jogador sem nickname'}>
      <p className="text-sm text-text-muted">ID: {profile.id}</p>
    </AuthLayout>
  )
}
