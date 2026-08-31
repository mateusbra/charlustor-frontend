import { useEffect, useState } from 'react'
import { AuthLayout } from '../auth/AuthLayout'
import { apiRequest } from '../auth/api'
import type { Season, SeasonRankingRow } from './tournamentTypes'

export function RankingPage() {
  const [season, setSeason] = useState<Season | null>(null)
  const [ranking, setRanking] = useState<SeasonRankingRow[] | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    apiRequest<Season | null>('/seasons/active')
      .then((activeSeason) => {
        setSeason(activeSeason)
        if (!activeSeason) return Promise.resolve([])
        return apiRequest<SeasonRankingRow[]>(`/seasons/${activeSeason.id}/ranking`)
      })
      .then((rows) => setRanking(rows ?? []))
      .finally(() => setLoaded(true))
  }, [])

  if (!loaded) {
    return (
      <AuthLayout title="Ranking" wide>
        <p className="text-sm text-text-muted">Carregando...</p>
      </AuthLayout>
    )
  }

  if (!season) {
    return (
      <AuthLayout title="Ranking" wide>
        <p className="text-sm text-text-muted">Nenhuma temporada ativa no momento.</p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title={`Ranking — ${season.name}`} wide>
      {ranking && ranking.length === 0 && (
        <p className="text-sm text-text-muted">Nenhum torneio concluído nesta temporada ainda.</p>
      )}
      {ranking && ranking.length > 0 && (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-text-muted">
              <th className="pb-2">#</th>
              <th className="pb-2">Jogador</th>
              <th className="pb-2">Pontos</th>
              <th className="pb-2">Torneios</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((row) => (
              <tr key={row.userId} className="border-t border-panel-border">
                <td className={`py-2 font-display font-semibold ${row.position <= 3 ? 'text-brand-gold' : 'text-text'}`}>
                  {row.position}
                </td>
                <td className="py-2 text-text">{row.nickname ?? '(sem nickname)'}</td>
                <td className="py-2 text-brand-pink">{row.points}</td>
                <td className="py-2 text-text-muted">{row.tournamentsPlayed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AuthLayout>
  )
}
