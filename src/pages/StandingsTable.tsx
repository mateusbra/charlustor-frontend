import type { StandingRow } from './tournamentTypes'

export function StandingsTable({ standings }: { standings: StandingRow[] }) {
  if (standings.length === 0) return <p className="text-sm text-text-muted">Sem partidas confirmadas ainda.</p>

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="text-xs text-text-muted">
          <th className="pb-1">#</th>
          <th className="pb-1">Jogador</th>
          <th className="pb-1">Pts</th>
          <th className="pb-1">V-D</th>
          <th className="pb-1">Buchholz</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((row) => (
          <tr key={row.participantId} className="border-t border-panel-border">
            <td className={`py-1 font-display font-semibold ${row.position <= 3 ? 'text-brand-gold' : 'text-text'}`}>{row.position}</td>
            <td className="py-1 text-text">{row.nickname ?? '(sem nickname)'}</td>
            <td className="py-1 text-brand-pink">{row.points}</td>
            <td className="py-1 text-text-muted">
              {row.wins}-{row.losses}
            </td>
            <td className="py-1 text-text-muted">{row.buchholz}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
