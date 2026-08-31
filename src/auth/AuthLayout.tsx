import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthContext'

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="text-sm text-text-muted transition hover:text-brand-pink">
      {children}
    </Link>
  )
}

function Header() {
  const { user, logout } = useAuth()
  const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'ADMIN'
  const isAdmin = user?.role === 'ADMIN'

  return (
    <header className="border-b border-panel-border/60 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-wide text-transparent"
          style={{ backgroundImage: 'linear-gradient(90deg, var(--color-brand-pink), var(--color-brand-purple))', backgroundClip: 'text', WebkitBackgroundClip: 'text' }}
        >
          CHARLUSTOR
        </Link>
        <nav className="flex flex-wrap items-center gap-4">
          <NavLink to="/ranking">Ranking</NavLink>
          {isOrganizer && <NavLink to="/organizer">Painel</NavLink>}
          {isOrganizer && <NavLink to="/organizer/tournaments">Meus torneios</NavLink>}
          {isAdmin && <NavLink to="/admin/users">Usuários</NavLink>}
          {isAdmin && <NavLink to="/admin/seasons">Temporadas</NavLink>}
          {user ? (
            <>
              <NavLink to="/profile">Perfil</NavLink>
              <button onClick={() => logout()} className="text-sm text-text-muted transition hover:text-brand-red">
                Sair
              </button>
            </>
          ) : (
            <NavLink to="/login">Entrar</NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}

export function AuthLayout({ title, children, wide }: { title: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto flex max-w-4xl justify-center px-4 py-10 sm:px-6">
        <div
          className={`w-full ${wide ? 'max-w-2xl' : 'max-w-sm'} rounded-xl border border-panel-border bg-panel/80 p-8 shadow-[0_0_40px_-15px_var(--color-brand-purple)]`}
        >
          <h1 className="font-display mb-4 text-xl font-semibold text-text">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  )
}
