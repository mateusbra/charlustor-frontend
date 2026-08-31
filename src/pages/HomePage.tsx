import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AuthLayout } from '../auth/AuthLayout'
import { apiRequest } from '../auth/api'
import { Badge } from '../components/Badge'
import { FORMAT_LABELS, TOURNAMENT_STATUS_BADGE, type Tournament, type TournamentStatus } from './tournamentTypes'

type YoutubeVideo = {
  id: string
  title: string
  url: string
  thumbnailUrl: string
  publishedAt: string
}

const HIGHLIGHT_STATUSES: TournamentStatus[] = ['REGISTRATION_OPEN', 'IN_PROGRESS']

export function HomePage() {
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[] | null>(null)
  const [videos, setVideos] = useState<YoutubeVideo[] | null>(null)

  useEffect(() => {
    apiRequest<Tournament[]>('/tournaments')
      .then(setTournaments)
      .catch(() => setTournaments([]))
    apiRequest<YoutubeVideo[]>('/youtube/videos')
      .then(setVideos)
      .catch(() => setVideos([]))
  }, [])

  const highlighted = (tournaments ?? [])
    .filter((t) => HIGHLIGHT_STATUSES.includes(t.status))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 4)

  return (
    <AuthLayout title="Torneios semanais de Master Duel" wide>
      <p className="mb-6 text-sm text-text-muted">
        {user ? (
          <>
            Bem-vindo de volta, <span className="font-medium text-text">{user.email}</span>.
          </>
        ) : (
          <>
            Entre pra se inscrever nos próximos torneios.{' '}
            <Link to="/register" className="text-brand-pink hover:underline">
              Criar conta
            </Link>{' '}
            ou{' '}
            <Link to="/login" className="text-brand-pink hover:underline">
              entrar
            </Link>
            .
          </>
        )}
      </p>

      <section className="mb-8">
        <h2 className="font-display mb-3 text-lg font-bold text-text">Próximos torneios</h2>
        {tournaments === null && <p className="text-sm text-text-muted">Carregando...</p>}
        {tournaments !== null && highlighted.length === 0 && (
          <p className="text-sm text-text-muted">Nenhum torneio com inscrição aberta no momento.</p>
        )}
        <ul className="grid gap-3 sm:grid-cols-2">
          {highlighted.map((t) => (
            <li key={t.id} className="rounded-lg border border-panel-border border-l-4 border-l-brand-pink bg-panel-soft p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-bold text-text">{t.name}</h3>
                <Badge color={TOURNAMENT_STATUS_BADGE[t.status]}>{t.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                {FORMAT_LABELS[t.format]} — {new Date(t.scheduledAt).toLocaleString('pt-BR')}
              </p>
              <Link
                to={`/tournaments/${t.id}`}
                className="mt-3 inline-block text-xs font-bold tracking-wide text-brand-cyan uppercase hover:underline"
              >
                Ver torneio →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display mb-3 text-lg font-bold text-text">Últimos vídeos</h2>
        {videos === null && <p className="text-sm text-text-muted">Carregando...</p>}
        {videos !== null && videos.length === 0 && <p className="text-sm text-text-muted">Nenhum vídeo encontrado.</p>}
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {videos?.map((v) => (
            <li key={v.id}>
              <a href={v.url} target="_blank" rel="noreferrer" className="group block">
                <img src={v.thumbnailUrl} alt={v.title} className="w-full rounded-lg border border-panel-border" />
                <p className="mt-2 text-sm text-text transition group-hover:text-brand-pink">{v.title}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </AuthLayout>
  )
}
