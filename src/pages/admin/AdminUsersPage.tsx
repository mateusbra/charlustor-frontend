import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { AuthLayout } from '../../auth/AuthLayout'
import { apiRequest } from '../../auth/api'
import type { AdminUser, Role } from '../tournamentTypes'

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
    <AuthLayout title="Usuários">
      {users === null && <p className="text-sm text-gray-500">Carregando...</p>}
      {users !== null && users.length === 0 && <p className="text-sm text-gray-500">Nenhum usuário cadastrado.</p>}
      <ul className="space-y-2">
        {users?.map((u) => (
          <li key={u.id} className="flex items-center justify-between text-sm">
            <span>
              {u.nickname ?? u.email} <span className="text-gray-500">({u.email})</span>
            </span>
            <select
              value={u.role}
              onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </AuthLayout>
  )
}
