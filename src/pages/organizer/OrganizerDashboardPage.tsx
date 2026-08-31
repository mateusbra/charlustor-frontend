import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { AuthLayout } from '../../auth/AuthLayout'
import { apiRequest } from '../../auth/api'
import { FORMAT_LABELS, TOURNAMENT_STATUS_BADGE, type OrganizerDashboardRow } from '../tournamentTypes'
import { Badge } from '../../components/Badge'

export function OrganizerDashboardPage() {
  const { accessToken } = useAuth()
  const [tournaments, setTournaments] = useState<OrganizerDashboardRow[] | null>(null)

  useEffect(() => {
    apiRequest<OrganizerDashboardRow[]>('/organizers/me/dashboard', { token: accessToken ?? undefined }).then(setTournaments)
  }, [accessToken])

  return (
    <AuthLayout title="Painel do organizador" wide>
      {tournaments === null && <p className="text-sm text-text-muted">Carregando...</p>}
      {tournaments !== null && tournaments.length === 0 && (
        <p className="text-sm text-text-muted">Você ainda não criou nenhum torneio.</p>
      )}
      <ul className="grid gap-3 sm:grid-cols-2">
        {tournaments?.map((t) => (
          <li key={t.id} className="rounded-lg border border-panel-border border-l-4 border-l-brand-pink bg-panel-soft p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-text">{t.name}</h3>
              <Badge color={TOURNAMENT_STATUS_BADGE[t.status]}>{t.status}</Badge>
            </div>
            <p className="mt-1 text-xs text-text-muted">{FORMAT_LABELS[t.format]}</p>
            {(t.pendingDecksCount > 0 || t.disputedMatchesCount > 0) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {t.pendingDecksCount > 0 && <Badge color="gold">{t.pendingDecksCount} deck(s) pendente(s)</Badge>}
                {t.disputedMatchesCount > 0 && <Badge color="red">{t.disputedMatchesCount} partida(s) em disputa</Badge>}
              </div>
            )}
            <Link
              to={`/organizer/tournaments/${t.id}/edit`}
              className="mt-3 inline-block text-xs font-bold tracking-wide text-brand-cyan uppercase hover:underline"
            >
              Ver torneio →
            </Link>
          </li>
        ))}
      </ul>
    </AuthLayout>
  )
}
