import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

type Mode = 'login' | 'register'

export default function Login() {
  const { loginEmail, loginGoogle, register } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await loginEmail(email, password)
      } else {
        await register(email, password)
      }
      navigate('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('Email ou senha inválidos.')
      } else if (msg.includes('email-already-in-use')) {
        setError('Email já cadastrado.')
      } else if (msg.includes('weak-password')) {
        setError('Senha muito fraca. Mínimo 6 caracteres.')
      } else {
        setError('Erro ao autenticar. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await loginGoogle()
      navigate('/')
    } catch {
      setError('Erro ao entrar com Google.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-slide">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-accent">
            Controle de Serviço
          </p>
          <h1 className="mt-3 font-syne text-4xl font-bold text-brand-text">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h1>
        </div>

        <div className="rounded-[2rem] border border-brand-border bg-brand-card/75 p-8 shadow-soft backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="app-field-label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="app-input"
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="app-field-label">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="app-input"
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-accent px-6 py-3 font-semibold text-brand-bg transition hover:opacity-90 disabled:opacity-50"
            >
              {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-brand-border" />
            <span className="text-sm text-brand-muted">ou</span>
            <div className="h-px flex-1 bg-brand-border" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-brand-border bg-brand-bg/60 px-6 py-3 text-brand-text transition hover:border-brand-accent hover:text-brand-accent disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </button>

          <p className="mt-6 text-center text-sm text-brand-muted">
            {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="text-brand-accent hover:underline"
            >
              {mode === 'login' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
