import { BarChart3, ClipboardList, CreditCard, LayoutDashboard, LogOut } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/servicos', label: 'Servicos', icon: ClipboardList },
  { to: '/despesas', label: 'Despesas', icon: CreditCard },
  { to: '/relatorio', label: 'Relatorio', icon: BarChart3 },
]

const BottomNav = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 rounded-3xl border border-brand-border bg-brand-card/95 p-2 shadow-soft backdrop-blur md:hidden">
      <ul className="grid grid-cols-5 gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-brand-accent text-brand-bg'
                    : 'text-brand-muted hover:text-brand-text'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          </li>
        ))}
        <li>
          <button
            onClick={handleLogout}
            className="flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold text-brand-danger transition hover:bg-brand-danger/10"
          >
            <LogOut size={18} />
            Sair
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default BottomNav
