import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { AuthLayout } from '../../auth/AuthLayout'
import { apiRequest } from '../../auth/api'
import { FORMAT_LABELS, type Tournament } from './types'
import { TournamentForm, type TournamentFormValues } from './TournamentForm'

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
    <AuthLayout title="Meus torneios">
      <TournamentForm initialValues={EMPTY_FORM} submitLabel="Criar torneio" onSubmit={handleCreate} />

      <div className="mt-6 border-t border-gray-200 pt-4">
        {tournaments === null && <p className="text-sm text-gray-500">Carregando...</p>}
        {tournaments !== null && myTournaments.length === 0 && (
          <p className="text-sm text-gray-500">Você ainda não criou nenhum torneio.</p>
        )}
        <ul className="space-y-2">
          {myTournaments.map((t) => (
            <li key={t.id} className="flex items-center justify-between text-sm">
              <span>
                {t.name} — {FORMAT_LABELS[t.format]} — <span className="text-gray-500">{t.status}</span>
              </span>
              <Link to={`/organizer/tournaments/${t.id}/edit`} className="text-gray-500 underline">
                Editar
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AuthLayout>
  )
}
