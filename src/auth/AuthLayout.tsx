import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthContext'

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="text-xs font-bold tracking-widest text-text-muted uppercase transition hover:text-brand-pink"
    >
      {children}
    </Link>
  )
}

function Header() {
  const { user, logout } = useAuth()
  const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'ADMIN'
  const isAdmin = user?.role === 'ADMIN'

  return (
    <header className="border-b border-panel-border bg-ink-deep">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="font-display text-2xl font-bold tracking-wide text-transparent"
          style={{ backgroundImage: 'linear-gradient(90deg, var(--color-brand-pink), var(--color-brand-purple))', backgroundClip: 'text', WebkitBackgroundClip: 'text' }}
        >
          CHARLUSTOR
        </Link>
        <nav className="flex flex-wrap items-center gap-5">
          <NavLink to="/ranking">Ranking</NavLink>
          {isOrganizer && <NavLink to="/organizer">Painel</NavLink>}
          {isOrganizer && <NavLink to="/organizer/tournaments">Meus torneios</NavLink>}
          {isAdmin && <NavLink to="/admin/users">Usuários</NavLink>}
          {isAdmin && <NavLink to="/admin/seasons">Temporadas</NavLink>}
          {user ? (
            <>
              <NavLink to="/profile">Perfil</NavLink>
              <button
                onClick={() => logout()}
                className="text-xs font-bold tracking-widest text-text-muted uppercase transition hover:text-brand-red"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded bg-gradient-to-r from-brand-pink to-brand-purple px-4 py-1.5 text-xs font-bold tracking-widest text-white uppercase transition hover:opacity-90"
            >
              Entrar
            </Link>
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
      <main className="mx-auto flex max-w-5xl justify-center px-4 py-10 sm:px-6">
        <div className={`w-full ${wide ? 'max-w-3xl' : 'max-w-sm'} rounded-lg border border-panel-border bg-panel`}>
          <div className="rounded-t-lg border-b-2 border-brand-pink bg-panel-soft px-6 py-4 sm:px-8">
            <h1 className="font-display text-2xl font-bold text-text">{title}</h1>
          </div>
          <div className="p-6 sm:p-8">{children}</div>
        </div>
      </main>
    </div>
  )
}
