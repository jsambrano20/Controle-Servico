import {
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import Card from '../components/Card'
import Modal from '../components/Modal'
import { emitToast } from '../components/Toast'
import { useAppContext } from '../context/AppContext'
import type { ItemServico, Obra, TipoItemServico } from '../types'
import {
  createId,
  formatBRL,
  formatPeriod,
  getTodayIso,
  getItemTypeLabel,
  sumItemAbsoluteValue,
  sumItemSubtotal,
  sumObraTotal,
  toNumber,
} from '../utils/formatters'

const unidades: ItemServico['unidade'][] = ['mts', 'km', 'un', 'h', 'm²', 'outro']
const tiposItem: TipoItemServico[] = ['receita', 'despesa']

interface ObraFormState {
  periodoInicio: string
  periodoFim: string
  localizacao: string
  modoPeriodo: 'unica' | 'periodo'
  itens: ItemServico[]
}

const createEmptyItem = (): ItemServico => ({
  id: createId('item'),
  tipo: 'receita',
  servico: '',
  descricao: '',
  quantidade: 0,
  unidade: 'un',
  valorUnitario: 0,
  subtotal: 0,
})

const createEmptyForm = (): ObraFormState => ({
  periodoInicio: getTodayIso(),
  periodoFim: getTodayIso(),
  localizacao: '',
  modoPeriodo: 'unica',
  itens: [createEmptyItem()],
})

const normalizeItems = (items: ItemServico[]) =>
  items.map((item) => ({
    ...item,
    subtotal: sumItemSubtotal(item),
  }))

const SelectField = ({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) => (
  <div className="relative overflow-hidden rounded-2xl border border-brand-border bg-brand-card">
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full bg-transparent px-4 py-3 pr-12 text-brand-text outline-none"
    >
      {children}
    </select>
    <ChevronDown
      size={18}
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted"
    />
  </div>
)

const ObraForm = ({
  form,
  setForm,
  onSubmit,
  submitLabel,
}: {
  form: ObraFormState
  setForm: Dispatch<SetStateAction<ObraFormState>>
  onSubmit: () => void
  submitLabel: string
}) => {
  const totalObra = useMemo(() => sumObraTotal(form.itens), [form.itens])

  const updateItem = (id: string, field: keyof ItemServico, value: string) => {
    setForm((current) => ({
      ...current,
      itens: current.itens.map((item) => {
        if (item.id !== id) return item
        const nextItem = {
          ...item,
          [field]:
            field === 'quantidade' || field === 'valorUnitario'
              ? toNumber(value)
              : value,
        } as ItemServico
        return { ...nextItem, subtotal: sumItemSubtotal(nextItem) }
      }),
    }))
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-muted">Modo do periodo</span>
          <div className="grid h-[50px] grid-cols-2 rounded-2xl border border-brand-border bg-brand-bg/60 p-1">
            {(['unica', 'periodo'] as const).map((modo) => (
              <button
                key={modo}
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    modoPeriodo: modo,
                    periodoFim: modo === 'unica' ? current.periodoInicio : current.periodoFim,
                  }))
                }
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  form.modoPeriodo === modo
                    ? 'bg-brand-accent text-brand-bg'
                    : 'text-brand-muted'
                }`}
              >
                {modo === 'unica' ? 'Data Unica' : 'Periodo'}
              </button>
            ))}
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-muted">Data inicial</span>
          <input
            type="date"
            value={form.periodoInicio}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                periodoInicio: event.target.value,
                ...(current.modoPeriodo === 'unica' ? { periodoFim: event.target.value } : {}),
              }))
            }
            className="w-full rounded-2xl border border-brand-border bg-brand-bg/60 px-4 py-3 text-brand-text outline-none focus:border-brand-accent"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-brand-muted">
            {form.modoPeriodo === 'unica' ? 'Data' : 'Data final'}
          </span>
          <input
            type="date"
            value={form.modoPeriodo === 'unica' ? form.periodoInicio : form.periodoFim}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                ...(current.modoPeriodo === 'unica'
                  ? { periodoInicio: event.target.value, periodoFim: event.target.value }
                  : { periodoFim: event.target.value }),
              }))
            }
            disabled={form.modoPeriodo === 'unica'}
            className="w-full rounded-2xl border border-brand-border bg-brand-bg/60 px-4 py-3 text-brand-text outline-none focus:border-brand-accent disabled:opacity-60"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-brand-muted">Localizacao / obra</span>
        <input
          type="text"
          list="obras-salvas"
          value={form.localizacao}
          onChange={(event) =>
            setForm((current) => ({ ...current, localizacao: event.target.value }))
          }
          placeholder="Ex.: Cambara EPR"
          className="w-full rounded-2xl border border-brand-border bg-brand-bg/60 px-4 py-3 text-brand-text outline-none focus:border-brand-accent"
        />
      </label>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-syne text-2xl font-bold text-brand-text">Itens de servico</h3>
            <p className="text-sm text-brand-muted">
              Subtotal calculado automaticamente a cada alteracao.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setForm((current) => ({
                ...current,
                itens: [...current.itens, createEmptyItem()],
              }))
            }
            className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2 font-bold text-brand-bg transition hover:brightness-110"
          >
            <Plus size={16} />
            Adicionar item
          </button>
        </div>

        <div className="space-y-4">
          {form.itens.map((item, index) => (
            <div key={item.id} className="rounded-3xl border border-brand-border bg-brand-bg/55 p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-brand-muted">Item {index + 1}</span>
                {form.itens.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        itens: current.itens.filter((entry) => entry.id !== item.id),
                      }))
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-brand-danger/40 px-3 py-2 text-sm font-semibold text-brand-danger transition hover:bg-brand-danger/10"
                  >
                    <Trash2 size={16} />
                    Remover
                  </button>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                <label>
                  <span className="app-field-label">Tipo do item</span>
                  <SelectField
                    value={item.tipo}
                    onChange={(value) => updateItem(item.id, 'tipo', value)}
                  >
                    {tiposItem.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {getItemTypeLabel(tipo)}
                      </option>
                    ))}
                  </SelectField>
                </label>
                <label>
                  <span className="app-field-label">Servico</span>
                  <input
                    type="text"
                    value={item.servico}
                    onChange={(event) => updateItem(item.id, 'servico', event.target.value)}
                    placeholder="Ex.: Cabo e cordoalha"
                    className="app-input bg-brand-card"
                  />
                </label>
                <label>
                  <span className="app-field-label">Descricao</span>
                  <input
                    type="text"
                    value={item.descricao}
                    onChange={(event) => updateItem(item.id, 'descricao', event.target.value)}
                    placeholder="Detalhe do item"
                    className="app-input bg-brand-card"
                  />
                </label>
                <label>
                  <span className="app-field-label">Quantidade</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.quantidade}
                    onChange={(event) => updateItem(item.id, 'quantidade', event.target.value)}
                    placeholder="0"
                    className="app-input bg-brand-card"
                  />
                </label>
                <label>
                  <span className="app-field-label">Unidade</span>
                  <SelectField
                    value={item.unidade}
                    onChange={(value) => updateItem(item.id, 'unidade', value)}
                  >
                    {unidades.map((unidade) => (
                      <option key={unidade} value={unidade}>
                        {unidade}
                      </option>
                    ))}
                  </SelectField>
                </label>
                <label>
                  <span className="app-field-label">Valor unitario</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.valorUnitario}
                    onChange={(event) =>
                      updateItem(item.id, 'valorUnitario', event.target.value)
                    }
                    placeholder="0,00"
                    className="app-input bg-brand-card"
                  />
                </label>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-brand-border bg-brand-card px-4 py-3">
                  <span className="app-field-label">Valor bruto do item</span>
                  <p className="font-bold text-brand-text">
                    {formatBRL(sumItemAbsoluteValue(item))}
                  </p>
                </div>
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                    item.tipo === 'despesa'
                      ? 'border-brand-danger/40 bg-brand-danger/10 text-brand-danger'
                      : 'border-brand-success/40 bg-brand-success/10 text-brand-success'
                  }`}
                >
                  <span className="app-field-label">Impacto no total</span>
                  <p className="text-base">{formatBRL(item.subtotal)}</p>
                </div>
                <div className="rounded-2xl border border-brand-accent/40 bg-brand-accent/10 px-4 py-3 text-sm font-bold text-brand-accent">
                  <span className="app-field-label">Resumo</span>
                  <p className="text-base">
                    {item.tipo === 'despesa'
                      ? 'Esse item sera subtraido da obra.'
                      : 'Esse item sera somado na obra.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-brand-border bg-brand-bg/55 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-brand-muted">Total da obra</p>
          <p className="text-3xl font-bold text-brand-accent">{formatBRL(totalObra)}</p>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-xl bg-brand-accent px-5 py-3 font-bold text-brand-bg transition hover:brightness-110"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  )
}

const Servicos = () => {
  const { state, addObra, updateObra, deleteObra } = useAppContext()
  const [form, setForm] = useState<ObraFormState>(createEmptyForm)
  const [editingObra, setEditingObra] = useState<Obra | null>(null)
  const [obraParaExcluir, setObraParaExcluir] = useState<Obra | null>(null)

  const sortedObras = [...state.obras].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
  const localizacoes = Array.from(new Set(state.obras.map((obra) => obra.localizacao)))

  const saveNewObra = () => {
    const itens = normalizeItems(form.itens).filter((item) => item.servico.trim())
    if (!form.localizacao.trim() || itens.length === 0) {
      emitToast({ type: 'error', message: 'Preencha a localizacao e ao menos um item valido.' })
      return
    }

    addObra({
      periodoInicio: form.periodoInicio,
      periodoFim: form.modoPeriodo === 'unica' ? form.periodoInicio : form.periodoFim,
      localizacao: form.localizacao.trim(),
      itens,
      totalObra: sumObraTotal(itens),
    })
    setForm(createEmptyForm())
    emitToast({ type: 'success', message: 'Obra salva com sucesso.' })
  }

  const submitEdit = () => {
    if (!editingObra) return
    const itens = normalizeItems(editingObra.itens).filter((item) => item.servico.trim())
    if (!editingObra.localizacao.trim() || itens.length === 0) {
      emitToast({ type: 'error', message: 'Revise os campos obrigatorios da obra.' })
      return
    }

    updateObra({
      ...editingObra,
      itens,
      totalObra: sumObraTotal(itens),
    })
    setEditingObra(null)
    emitToast({ type: 'success', message: 'Obra atualizada com sucesso.' })
  }

  return (
    <div className="space-y-6">
      <datalist id="obras-salvas">
        {localizacoes.map((localizacao) => (
          <option key={localizacao} value={localizacao} />
        ))}
      </datalist>

      <Card className="animate-fade-slide">
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-accent">Servicos</p>
          <h2 className="mt-2 font-syne text-3xl font-bold text-brand-text">Nova obra</h2>
        </div>
        <ObraForm
          form={form}
          setForm={setForm}
          onSubmit={saveNewObra}
          submitLabel="Salvar obra"
        />
      </Card>

      <Card className="animate-fade-slide">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-syne text-2xl font-bold text-brand-text">
              Obras registradas
            </h3>
            <p className="text-sm text-brand-muted">
              Ordenadas da mais recente para a mais antiga.
            </p>
          </div>
          <span className="rounded-full border border-brand-border px-3 py-1 text-sm text-brand-muted">
            {sortedObras.length} obra(s)
          </span>
        </div>

        <div className="space-y-4">
          {sortedObras.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-brand-border p-6 text-center text-brand-muted">
              Nenhuma obra cadastrada ainda.
            </p>
          ) : (
            sortedObras.map((obra) => (
              <div key={obra.id} className="rounded-3xl border border-brand-border bg-brand-bg/55 p-4">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="mb-2 inline-flex rounded-full bg-brand-accent/15 px-3 py-1 text-xs font-bold text-brand-accent">
                      {formatPeriod(obra.periodoInicio, obra.periodoFim)}
                    </div>
                    <h4 className="text-xl font-bold text-brand-text">{obra.localizacao}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingObra(obra)}
                      className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-4 py-2 text-sm font-semibold text-brand-text transition hover:bg-brand-card"
                    >
                      <Pencil size={16} />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setObraParaExcluir(obra)}
                      className="inline-flex items-center gap-2 rounded-xl border border-brand-danger/40 px-4 py-2 text-sm font-semibold text-brand-danger transition hover:bg-brand-danger/10"
                    >
                      <Trash2 size={16} />
                      Excluir
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-brand-border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-brand-card/90 text-left text-brand-muted">
                      <tr>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Servico</th>
                        <th className="px-4 py-3">Descricao</th>
                        <th className="px-4 py-3">Qtd</th>
                        <th className="px-4 py-3">Un</th>
                        <th className="px-4 py-3">Vlr Unit</th>
                        <th className="px-4 py-3">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {obra.itens.map((item) => (
                        <tr key={item.id} className="border-t border-brand-border/80 text-brand-text">
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                item.tipo === 'despesa'
                                  ? 'bg-brand-danger/15 text-brand-danger'
                                  : 'bg-brand-success/15 text-brand-success'
                              }`}
                            >
                              {item.tipo === 'despesa' ? 'Despesa' : 'Receita'}
                            </span>
                          </td>
                          <td className="px-4 py-3">{item.servico}</td>
                          <td className="px-4 py-3">{item.descricao}</td>
                          <td className="px-4 py-3">{item.quantidade}</td>
                          <td className="px-4 py-3">{item.unidade}</td>
                          <td className="px-4 py-3">{formatBRL(item.valorUnitario)}</td>
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

                <div className="mt-4 text-right">
                  <span className="text-sm text-brand-muted">Total da obra</span>
                  <p className="text-2xl font-bold text-brand-accent">
                    {formatBRL(obra.totalObra)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal
        isOpen={Boolean(editingObra)}
        title="Editar obra"
        onClose={() => setEditingObra(null)}
      >
        {editingObra && (
          <ObraForm
            form={{
              periodoInicio: editingObra.periodoInicio,
              periodoFim: editingObra.periodoFim,
              localizacao: editingObra.localizacao,
              modoPeriodo:
                editingObra.periodoInicio === editingObra.periodoFim ? 'unica' : 'periodo',
              itens: editingObra.itens,
            }}
            setForm={(value) => {
              if (typeof value === 'function') {
                setEditingObra((current) => {
                  if (!current) return current
                  const next = value({
                    periodoInicio: current.periodoInicio,
                    periodoFim: current.periodoFim,
                    localizacao: current.localizacao,
                    modoPeriodo:
                      current.periodoInicio === current.periodoFim ? 'unica' : 'periodo',
                    itens: current.itens,
                  })
                  return {
                    ...current,
                    periodoInicio: next.periodoInicio,
                    periodoFim:
                      next.modoPeriodo === 'unica' ? next.periodoInicio : next.periodoFim,
                    localizacao: next.localizacao,
                    itens: next.itens,
                    totalObra: sumObraTotal(next.itens),
                  }
                })
                return
              }

              setEditingObra((current) =>
                current
                  ? {
                      ...current,
                      periodoInicio: value.periodoInicio,
                      periodoFim:
                        value.modoPeriodo === 'unica' ? value.periodoInicio : value.periodoFim,
                      localizacao: value.localizacao,
                      itens: value.itens,
                      totalObra: sumObraTotal(value.itens),
                    }
                  : current,
              )
            }}
            onSubmit={submitEdit}
            submitLabel="Salvar alteracoes"
          />
        )}
      </Modal>

      <Modal
        isOpen={Boolean(obraParaExcluir)}
        title="Excluir obra"
        onClose={() => setObraParaExcluir(null)}
      >
        <div className="space-y-5">
          <p className="text-brand-muted">
            Esta acao remove a obra selecionada e desvincula as despesas associadas.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setObraParaExcluir(null)}
              className="rounded-xl border border-brand-border px-4 py-2 font-semibold text-brand-text"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                if (!obraParaExcluir) return
                deleteObra(obraParaExcluir.id)
                setObraParaExcluir(null)
                emitToast({ type: 'success', message: 'Obra excluida com sucesso.' })
              }}
              className="rounded-xl bg-brand-danger px-4 py-2 font-bold text-white"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Servicos
