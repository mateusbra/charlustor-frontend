import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { AuthLayout } from '../../auth/AuthLayout'
import { apiRequest } from '../../auth/api'
import { ROLE_BADGE, type AdminUser, type Role } from '../tournamentTypes'
import { Badge } from '../../components/Badge'

const ROLES: Role[] = ['PLAYER', 'ORGANIZER', 'ADMIN']

export function AdminUsersPage() {
  const { accessToken } = useAuth()
  const [users, setUsers] = useState<AdminUser[] | null>(null)

  const load = () => {
    apiRequest<AdminUser[]>('/admin/users', { token: accessToken ?? undefined }).then(setUsers)
  }

  useEffect(load, [accessToken])

  const handleRoleChange = async (id: string, role: Role) => {
    await apiRequest(`/admin/users/${id}/role`, {
      method: 'PATCH',
      token: accessToken ?? undefined,
      body: JSON.stringify({ role }),
    })
    load()
  }

  return (
    <AuthLayout title="Usuários" wide>
      {users === null && <p className="text-sm text-text-muted">Carregando...</p>}
      {users !== null && users.length === 0 && <p className="text-sm text-text-muted">Nenhum usuário cadastrado.</p>}
      <ul className="space-y-2">
        {users?.map((u) => (
          <li key={u.id} className="flex items-center justify-between border-b border-panel-border pb-2 text-sm last:border-0">
            <span className="text-text">
              {u.nickname ?? u.email} <span className="text-text-muted">({u.email})</span>
            </span>
            <span className="flex items-center gap-2">
              <Badge color={ROLE_BADGE[u.role]}>{u.role}</Badge>
              <select
                value={u.role}
                onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                className="rounded border border-panel-border bg-ink/40 px-2 py-1 text-sm text-text focus:border-brand-pink focus:outline-none"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </span>
          </li>
        ))}
      </ul>
    </AuthLayout>
  )
}
