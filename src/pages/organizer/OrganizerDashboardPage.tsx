import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { AuthLayout } from '../../auth/AuthLayout'
import { apiRequest } from '../../auth/api'
import { FORMAT_LABELS, type OrganizerDashboardRow } from '../tournamentTypes'

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
      <ul className="space-y-3">
        {tournaments?.map((t) => (
          <li key={t.id} className="rounded-lg border border-panel-border bg-panel-soft/40 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text">
                {t.name} — {FORMAT_LABELS[t.format]} — <span className="text-text-muted">{t.status}</span>
              </span>
              <Link to={`/organizer/tournaments/${t.id}/edit`} className="text-brand-cyan hover:underline">
                Ver torneio
              </Link>
            </div>
            {(t.pendingDecksCount > 0 || t.disputedMatchesCount > 0) && (
              <div className="mt-1 space-x-3 text-xs text-brand-gold">
                {t.pendingDecksCount > 0 && <span>{t.pendingDecksCount} deck(s) pendente(s)</span>}
                {t.disputedMatchesCount > 0 && <span>{t.disputedMatchesCount} partida(s) em disputa</span>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </AuthLayout>
  )
}
