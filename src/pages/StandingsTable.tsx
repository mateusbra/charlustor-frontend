import type { StandingRow } from './tournamentTypes'

export function StandingsTable({ standings }: { standings: StandingRow[] }) {
  if (standings.length === 0) return <p className="text-sm text-gray-500">Sem partidas confirmadas ainda.</p>

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="text-xs text-gray-500">
          <th className="pb-1">#</th>
          <th className="pb-1">Jogador</th>
          <th className="pb-1">Pts</th>
          <th className="pb-1">V-D</th>
          <th className="pb-1">Buchholz</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((row) => (
          <tr key={row.participantId} className="border-t border-gray-100">
            <td className="py-1">{row.position}</td>
            <td className="py-1">{row.nickname ?? '(sem nickname)'}</td>
            <td className="py-1">{row.points}</td>
            <td className="py-1">
              {row.wins}-{row.losses}
            </td>
            <td className="py-1">{row.buchholz}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
