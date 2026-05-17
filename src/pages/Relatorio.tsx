import { useMemo, useState } from 'react'
import { ChevronDown, Download, Printer } from 'lucide-react'
import Card from '../components/Card'
import { useAppContext } from '../context/AppContext'
import type { Filtro } from '../types'
import { exportReportCsv, printReport } from '../utils/exporters'
import {
  despesaMatchesFilter,
  formatBRL,
  formatDate,
  formatPeriod,
  getTodayIso,
  obraMatchesFilter,
} from '../utils/formatters'

const Relatorio = () => {
  const { state } = useAppContext()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const [filtro, setFiltro] = useState<Filtro>({
    modo: 'periodo',
    dataInicio: getTodayIso(),
    dataFim: getTodayIso(),
    obraId: '',
  })

  const obrasFiltradas = useMemo(
    () => state.obras.filter((obra) => obraMatchesFilter(obra, filtro)),
    [filtro, state.obras],
  )

  const despesasFiltradas = useMemo(
    () =>
      state.despesas.filter((despesa) =>
        despesaMatchesFilter(despesa, filtro, state.obras),
      ),
    [filtro, state.despesas, state.obras],
  )

  const totalItens = obrasFiltradas.reduce((acc, obra) => acc + obra.itens.length, 0)
  const receita = obrasFiltradas.reduce((acc, obra) => acc + obra.totalObra, 0)
  const despesas = despesasFiltradas.reduce((acc, despesa) => acc + despesa.valor, 0)
  const liquido = receita - despesas

  const toggleSection = (id: string) =>
    setOpenSections((current) => ({ ...current, [id]: !current[id] }))

  const totalItensReceita = obrasFiltradas.reduce(
    (acc, obra) => acc + obra.itens.filter((item) => item.tipo === 'receita').length,
    0,
  )

  const totalItensDespesa = obrasFiltradas.reduce(
    (acc, obra) => acc + obra.itens.filter((item) => item.tipo === 'despesa').length,
    0,
  )

  return (
    <div className="space-y-6">
      <Card className="animate-fade-slide print:hidden">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-accent">Relatorio</p>
            <h2 className="mt-2 font-syne text-3xl font-bold text-brand-text">
              Resultado consolidado
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => exportReportCsv(obrasFiltradas, despesasFiltradas)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2 font-bold text-brand-bg transition hover:brightness-110"
            >
              <Download size={16} />
              Exportar CSV
            </button>
            <button
              type="button"
              onClick={printReport}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-4 py-2 font-semibold text-brand-text"
            >
              <Printer size={16} />
              Imprimir / PDF
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-muted">Inicio</span>
            <input
              type="date"
              value={filtro.dataInicio}
              onChange={(event) =>
                setFiltro((current) => ({ ...current, dataInicio: event.target.value }))
              }
              className="w-full rounded-2xl border border-brand-border bg-brand-bg/60 px-4 py-3 text-brand-text outline-none focus:border-brand-accent"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-muted">Fim</span>
            <input
              type="date"
              value={filtro.dataFim}
              onChange={(event) =>
                setFiltro((current) => ({ ...current, dataFim: event.target.value }))
              }
              className="w-full rounded-2xl border border-brand-border bg-brand-bg/60 px-4 py-3 text-brand-text outline-none focus:border-brand-accent"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-muted">Obra / localizacao</span>
            <div className="relative overflow-hidden rounded-2xl border border-brand-border bg-brand-bg/60">
              <select
                value={filtro.obraId ?? ''}
                onChange={(event) =>
                  setFiltro((current) => ({ ...current, obraId: event.target.value }))
                }
                className="w-full bg-transparent px-4 py-3 pr-12 text-brand-text outline-none"
              >
                <option value="">Todas as obras</option>
                {state.obras.map((obra) => (
                  <option key={obra.id} value={obra.id}>
                    {obra.localizacao}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted"
              />
            </div>
          </label>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Total de Obras', value: String(obrasFiltradas.length), tone: 'text-brand-accent' },
          {
            label: 'Total de Itens',
            value: `${totalItens} (${totalItensReceita} + / ${totalItensDespesa} -)`,
            tone: 'text-brand-text',
          },
          { label: 'Receita', value: formatBRL(receita), tone: 'text-brand-success' },
          { label: 'Despesas', value: formatBRL(despesas), tone: 'text-brand-danger' },
          {
            label: 'Resultado Liquido',
            value: formatBRL(liquido),
            tone: liquido >= 0 ? 'text-brand-success' : 'text-brand-danger',
          },
        ].map((card) => (
          <Card key={card.label} className="animate-fade-slide">
            <p className="text-sm text-brand-muted">{card.label}</p>
            <p className={`mt-3 text-2xl font-bold ${card.tone}`}>{card.value}</p>
          </Card>
        ))}
      </div>

      <Card className="animate-fade-slide">
        <div className="mb-5">
          <h3 className="font-syne text-2xl font-bold text-brand-text">
            Detalhamento por obra
          </h3>
          <p className="text-sm text-brand-muted">
            Itens de servico e despesas vinculadas dentro do filtro escolhido.
          </p>
        </div>

        <div className="space-y-4">
          {obrasFiltradas.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-brand-border p-6 text-center text-brand-muted">
              Nenhuma obra encontrada neste relatorio.
            </p>
          ) : (
            obrasFiltradas.map((obra) => {
              const aberta = openSections[obra.id] ?? true
              const despesasDaObra = despesasFiltradas.filter((despesa) => despesa.obraId === obra.id)

              return (
                <div key={obra.id} className="rounded-3xl border border-brand-border bg-brand-bg/55">
                  <button
                    type="button"
                    onClick={() => toggleSection(obra.id)}
                    className="flex w-full items-center justify-between gap-3 p-4 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 inline-flex rounded-full bg-brand-accent/15 px-3 py-1 text-xs font-bold text-brand-accent">
                        {formatPeriod(obra.periodoInicio, obra.periodoFim)}
                      </div>
                      <h4 className="truncate text-xl font-bold text-brand-text">{obra.localizacao}</h4>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <p className="text-lg font-bold text-brand-accent">
                        {formatBRL(obra.totalObra)}
                      </p>
                      <ChevronDown
                        size={18}
                        className={`text-brand-muted transition ${aberta ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {aberta && (
                    <div className="space-y-4 border-t border-brand-border px-4 py-4">
                      <div className="overflow-x-auto rounded-2xl border border-brand-border">
                        <table className="min-w-full text-sm">
                          <thead className="bg-brand-card/90 text-left text-brand-muted">
                            <tr>
                              <th className="px-4 py-3">Tipo</th>
                              <th className="px-4 py-3">Servico</th>
                              <th className="hidden px-4 py-3 md:table-cell">Descricao</th>
                              <th className="hidden px-4 py-3 sm:table-cell">Qtd</th>
                              <th className="hidden px-4 py-3 sm:table-cell">Un</th>
                              <th className="px-4 py-3">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {obra.itens.map((item) => (
                              <tr key={item.id} className="border-t border-brand-border/80 text-brand-text">
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                                      item.tipo === 'despesa'
                                        ? 'bg-brand-danger/15 text-brand-danger'
                                        : 'bg-brand-success/15 text-brand-success'
                                    }`}
                                  >
                                    {item.tipo === 'despesa' ? 'D' : 'R'}
                                    <span className="hidden sm:inline">
                                      {item.tipo === 'despesa' ? 'espesa' : 'eceita'}
                                    </span>
                                  </span>
                                </td>
                                <td className="px-4 py-3">{item.servico}</td>
                                <td className="hidden px-4 py-3 md:table-cell">{item.descricao}</td>
                                <td className="hidden px-4 py-3 sm:table-cell">{item.quantidade}</td>
                                <td className="hidden px-4 py-3 sm:table-cell">{item.unidade}</td>
                                <td
                                  className={`px-4 py-3 font-bold ${
                                    item.tipo === 'despesa'
                                      ? 'text-brand-danger'
                                      : 'text-brand-accent'
                                  }`}
                                >
                                  {formatBRL(item.subtotal)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="rounded-2xl border border-brand-border bg-brand-card/50 p-4">
                        <h5 className="mb-3 font-bold text-brand-text">Despesas vinculadas</h5>
                        {despesasDaObra.length === 0 ? (
                          <p className="text-sm text-brand-muted">
                            Nenhuma despesa vinculada a esta obra no periodo.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {despesasDaObra.map((despesa) => (
                              <div
                                key={despesa.id}
                                className="flex flex-col gap-2 rounded-2xl border border-brand-border bg-brand-bg/60 p-3 md:flex-row md:items-center md:justify-between"
                              >
                                <div>
                                  <p className="font-semibold text-brand-text">
                                    {despesa.categoria}
                                  </p>
                                  <p className="text-sm text-brand-muted">
                                    {formatDate(despesa.data)} • {despesa.descricao}
                                  </p>
                                </div>
                                <p className="text-lg font-bold text-brand-danger">
                                  {formatBRL(despesa.valor)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}

export default Relatorio
