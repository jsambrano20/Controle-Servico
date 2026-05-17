import { Route, Routes, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import Dashboard from './pages/Dashboard'
import Despesas from './pages/Despesas'
import Login from './pages/Login'
import Relatorio from './pages/Relatorio'
import Servicos from './pages/Servicos'

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Painel financeiro e operacional',
    subtitle: 'Acompanhe servicos, despesas e resultado liquido em tempo real.',
  },
  '/servicos': {
    title: 'Cadastro de servicos',
    subtitle: 'Registre obras, itens executados e totais por localizacao.',
  },
  '/despesas': {
    title: 'Controle de despesas',
    subtitle: 'Centralize custos de campo e vincule cada saida a uma obra.',
  },
  '/relatorio': {
    title: 'Relatorios exportaveis',
    subtitle: 'Filtre por periodo, detalhe por obra e gere CSV ou PDF.',
  },
}

function AppShell() {
  const location = useLocation()
  const meta = pageMeta[location.pathname] ?? pageMeta['/']

  return (
    <div className="min-h-screen bg-brand-bg bg-glow text-brand-text">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar />

        <main className="min-w-0 flex-1 pb-28 md:pb-10">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6 animate-fade-slide rounded-[2rem] border border-brand-border bg-brand-card/75 p-5 shadow-soft backdrop-blur">
              <div className="max-w-3xl">
                <p className="text-sm uppercase tracking-[0.3em] text-brand-accent">
                  Controle de Servico
                </p>
                <h1 className="mt-3 font-syne text-4xl font-bold leading-tight text-brand-text sm:text-5xl">
                  {meta.title}
                </h1>
                <p className="mt-3 max-w-2xl text-brand-muted">{meta.subtitle}</p>
              </div>
            </header>

            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/servicos" element={<Servicos />} />
              <Route path="/despesas" element={<Despesas />} />
              <Route path="/relatorio" element={<Relatorio />} />
            </Routes>
          </div>
        </main>
      </div>

      <BottomNav />
      <Toast />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
