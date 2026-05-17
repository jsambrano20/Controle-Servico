import { BriefcaseBusiness, CircleDollarSign, Receipt, Wallet } from 'lucide-react'
import Card from '../components/Card'
import { useAppContext } from '../context/AppContext'
import {
  despesaMatchesFilter,
  formatBRL,
  formatPeriod,
  obraMatchesFilter,
} from '../utils/formatters'

const Dashboard = () => {
  const { state, dispatch } = useAppContext()

  const obrasFiltradas = state.obras.filter((obra) => obraMatchesFilter(obra, state.filtro))
  const despesasFiltradas = state.despesas.filter((despesa) =>
    despesaMatchesFilter(despesa, state.filtro, state.obras),
  )

  const receita = obrasFiltradas.reduce((acc, obra) => acc + obra.totalObra, 0)
  const despesas = despesasFiltradas.reduce((acc, despesa) => acc + despesa.valor, 0)
  const liquido = receita - despesas

  const metrics = [
    {
      label: 'Receita Total',
      value: formatBRL(receita),
      icon: CircleDollarSign,
      tone: 'text-brand-success',
    },
    {
      label: 'Total de Despesas',
      value: formatBRL(despesas),
      icon: Receipt,
      tone: 'text-brand-danger',
    },
    {
      label: 'Resultado Liquido',
      value: formatBRL(liquido),
      icon: Wallet,
      tone: liquido >= 0 ? 'text-brand-success' : 'text-brand-danger',
    },
    {
      label: 'Quantidade de Obras',
      value: String(obrasFiltradas.length),
      icon: BriefcaseBusiness,
      tone: 'text-brand-accent',
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="animate-fade-slide overflow-hidden bg-gradient-to-br from-brand-card via-brand-card to-brand-bg">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-accent">
              Painel operacional
            </p>
            <h2 className="mt-2 font-syne text-3xl font-bold text-brand-text">
              Visao geral do periodo
            </h2>
          </div>

          <div className="inline-flex rounded-2xl border border-brand-border bg-brand-bg/60 p-1">
            {(['unica', 'periodo'] as const).map((modo) => (
              <button
                key={modo}
                type="button"
                onClick={() => dispatch({ type: 'SET_FILTRO', payload: { modo } })}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  state.filtro.modo === modo
                    ? 'bg-brand-accent text-brand-bg'
                    : 'text-brand-muted'
                }`}
              >
                {modo === 'unica' ? 'Data Unica' : 'Periodo'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-muted">Inicio</span>
            <input
              type="date"
              value={state.filtro.dataInicio}
              onChange={(event) =>
                dispatch({
                  type: 'SET_FILTRO',
                  payload: {
                    dataInicio: event.target.value,
                    ...(state.filtro.modo === 'unica'
                      ? { dataFim: event.target.value }
                      : {}),
                  },
                })
              }
              className="w-full rounded-2xl border border-brand-border bg-brand-bg/60 px-4 py-3 text-brand-text outline-none transition focus:border-brand-accent"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-muted">
              {state.filtro.modo === 'unica' ? 'Mesma data' : 'Fim'}
            </span>
            <input
              type="date"
              value={
                state.filtro.modo === 'unica'
                  ? state.filtro.dataInicio
                  : state.filtro.dataFim
              }
              onChange={(event) =>
                dispatch({
                  type: 'SET_FILTRO',
                  payload:
                    state.filtro.modo === 'unica'
                      ? { dataInicio: event.target.value, dataFim: event.target.value }
                      : { dataFim: event.target.value },
                })
              }
              disabled={state.filtro.modo === 'unica'}
              className="w-full rounded-2xl border border-brand-border bg-brand-bg/60 px-4 py-3 text-brand-text outline-none transition focus:border-brand-accent disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <Card
            key={label}
            className="animate-fade-slide bg-gradient-to-br from-brand-card to-brand-bg"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-brand-muted">{label}</span>
                <Icon className={tone} size={20} />
              </div>
              <div className={`text-3xl font-bold ${tone}`}>{value}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="animate-fade-slide">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-syne text-2xl font-bold text-brand-text">Obras no filtro</h3>
          <span className="text-sm text-brand-muted">{obrasFiltradas.length} registro(s)</span>
        </div>

        <div className="space-y-3">
          {obrasFiltradas.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-brand-border p-6 text-center text-brand-muted">
              Nenhuma obra encontrada para o periodo selecionado.
            </p>
          ) : (
            obrasFiltradas.map((obra) => (
              <div
                key={obra.id}
                className="rounded-2xl border border-brand-border bg-brand-bg/50 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-2 inline-flex rounded-full bg-brand-accent/15 px-3 py-1 text-xs font-bold text-brand-accent">
                      {formatPeriod(obra.periodoInicio, obra.periodoFim)}
                    </div>
                    <h4 className="text-lg font-bold text-brand-text">{obra.localizacao}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-brand-muted">Total da obra</p>
                    <p className="text-xl font-bold text-brand-accent">
                      {formatBRL(obra.totalObra)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

export default Dashboard
