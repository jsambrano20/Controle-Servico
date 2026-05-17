import { BarChart3, ClipboardList, CreditCard, LayoutDashboard, LogOut, WifiOff } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/servicos', label: 'Servicos', icon: ClipboardList },
  { to: '/despesas', label: 'Despesas', icon: CreditCard },
  { to: '/relatorio', label: 'Relatorio', icon: BarChart3 },
]

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col justify-between border-r border-brand-border bg-brand-card/80 p-6 backdrop-blur md:flex">
      <div>
        <div className="mb-10 space-y-3">
          <div className="inline-flex rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.3em] text-brand-accent">
            PWA Offline
          </div>
          <div>
            <h1 className="font-syne text-3xl font-bold text-brand-text">
              Controle de Servico
            </h1>
            <p className="mt-2 text-sm text-brand-muted">
              Gestao de servicos e despesas para equipes de campo.
            </p>
          </div>
        </div>

        <nav>
          <ul className="space-y-2">
            {links.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-brand-accent text-brand-bg'
                        : 'text-brand-muted hover:bg-brand-bg/60 hover:text-brand-text'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="space-y-3">
        <div className="rounded-3xl border border-brand-border bg-brand-bg/70 p-4">
          <div className="mb-2 flex items-center gap-2 text-brand-success">
            <WifiOff size={16} />
            <span className="text-sm font-semibold">Pronto para uso offline</span>
          </div>
          <p className="text-sm text-brand-muted">
            Depois do primeiro carregamento, o app continua funcionando sem internet.
          </p>
        </div>

        <div className="rounded-3xl border border-brand-border bg-brand-bg/70 p-4">
          <p className="mb-3 truncate text-sm text-brand-muted">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-danger/40 px-4 py-2 text-sm font-semibold text-brand-danger transition hover:bg-brand-danger/10"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
