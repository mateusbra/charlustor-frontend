import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { AuthLayout } from '../../auth/AuthLayout'
import { apiRequest } from '../../auth/api'
import { FORMAT_LABELS, TOURNAMENT_STATUS_BADGE, type Tournament } from '../tournamentTypes'
import { TournamentForm, type TournamentFormValues } from './TournamentForm'
import { Badge } from '../../components/Badge'

const EMPTY_FORM: TournamentFormValues = {
  name: '',
  format: 'SWISS',
  scheduledAt: '',
  roundsCount: '',
  topCutSize: '',
}

export function TournamentsListPage() {
  const { user, accessToken } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[] | null>(null)

  const loadTournaments = () => {
    apiRequest<Tournament[]>('/tournaments').then(setTournaments)
  }

  useEffect(loadTournaments, [])

  const handleCreate = async (values: TournamentFormValues) => {
    await apiRequest('/tournaments', {
      method: 'POST',
      token: accessToken ?? undefined,
      body: JSON.stringify({
        name: values.name,
        format: values.format,
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        roundsCount: values.roundsCount ? Number(values.roundsCount) : undefined,
        topCutSize: values.topCutSize ? Number(values.topCutSize) : undefined,
      }),
    })
    loadTournaments()
  }

  const myTournaments = tournaments?.filter((t) => t.organizerId === user?.id) ?? []

  return (
    <AuthLayout title="Meus torneios" wide>
      <TournamentForm initialValues={EMPTY_FORM} submitLabel="Criar torneio" onSubmit={handleCreate} />

      <div className="mt-6 border-t border-panel-border pt-4">
        {tournaments === null && <p className="text-sm text-text-muted">Carregando...</p>}
        {tournaments !== null && myTournaments.length === 0 && (
          <p className="text-sm text-text-muted">Você ainda não criou nenhum torneio.</p>
        )}
        <ul className="space-y-2">
          {myTournaments.map((t) => (
            <li key={t.id} className="flex items-center justify-between border-b border-panel-border pb-2 text-sm last:border-0">
              <span className="flex items-center gap-2 text-text">
                {t.name} <span className="text-text-muted">— {FORMAT_LABELS[t.format]}</span>
                <Badge color={TOURNAMENT_STATUS_BADGE[t.status]}>{t.status}</Badge>
              </span>
              <span className="space-x-3">
                <Link to={`/tournaments/${t.id}`} className="text-brand-cyan hover:underline">
                  Ver página pública
                </Link>
                <Link to={`/organizer/tournaments/${t.id}/edit`} className="text-brand-cyan hover:underline">
                  Editar
                </Link>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </AuthLayout>
  )
}
