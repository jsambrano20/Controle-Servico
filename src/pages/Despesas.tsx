import { useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, Pencil, Trash2 } from 'lucide-react'
import Card from '../components/Card'
import Modal from '../components/Modal'
import { emitToast } from '../components/Toast'
import { useAppContext } from '../context/AppContext'
import type { CategoriasDespesa, Despesa } from '../types'
import { formatBRL, formatDate, getTodayIso, toNumber } from '../utils/formatters'

const categorias: CategoriasDespesa[] = [
  'Pedágio',
  'Combustível',
  'Alimentação',
  'Hospedagem',
  'Material',
  'Outro',
]

interface DespesaFormState {
  data: string
  categoria: CategoriasDespesa
  descricao: string
  valor: number
  obraId: string
}

const createEmptyForm = (): DespesaFormState => ({
  data: getTodayIso(),
  categoria: 'Pedágio',
  descricao: '',
  valor: 0,
  obraId: '',
})

const SelectField = ({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) => (
  <div className="relative overflow-hidden rounded-2xl border border-brand-border bg-brand-bg/60">
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

const Despesas = () => {
  const { state, addDespesa, updateDespesa, deleteDespesa } = useAppContext()
  const [form, setForm] = useState<DespesaFormState>(createEmptyForm)
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null)
  const [despesaParaExcluir, setDespesaParaExcluir] = useState<Despesa | null>(null)

  const totalDespesas = useMemo(
    () => state.despesas.reduce((acc, despesa) => acc + despesa.valor, 0),
    [state.despesas],
  )

  const saveDespesa = () => {
    if (!form.descricao.trim() || form.valor <= 0) {
      emitToast({ type: 'error', message: 'Informe descricao e valor valido.' })
      return
    }

    addDespesa({
      data: form.data,
      categoria: form.categoria,
      descricao: form.descricao.trim(),
      valor: form.valor,
      obraId: form.obraId || undefined,
    })
    setForm(createEmptyForm())
    emitToast({ type: 'success', message: 'Despesa salva com sucesso.' })
  }

  const saveEdit = () => {
    if (!editingDespesa || !editingDespesa.descricao.trim() || editingDespesa.valor <= 0) {
      emitToast({ type: 'error', message: 'Revise os dados da despesa.' })
      return
    }

    updateDespesa(editingDespesa)
    setEditingDespesa(null)
    emitToast({ type: 'success', message: 'Despesa atualizada com sucesso.' })
  }

  return (
    <div className="space-y-6">
      <Card className="animate-fade-slide">
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-accent">Despesas</p>
          <h2 className="mt-2 font-syne text-3xl font-bold text-brand-text">
            Nova despesa
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-muted">Data</span>
            <input
              type="date"
              value={form.data}
              onChange={(event) => setForm((current) => ({ ...current, data: event.target.value }))}
              className="w-full rounded-2xl border border-brand-border bg-brand-bg/60 px-4 py-3 text-brand-text outline-none focus:border-brand-accent"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-muted">Categoria</span>
            <SelectField
              value={form.categoria}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  categoria: value as CategoriasDespesa,
                }))
              }
            >
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </SelectField>
          </label>

          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-semibold text-brand-muted">Descricao</span>
            <input
              type="text"
              value={form.descricao}
              onChange={(event) =>
                setForm((current) => ({ ...current, descricao: event.target.value }))
              }
              className="w-full rounded-2xl border border-brand-border bg-brand-bg/60 px-4 py-3 text-brand-text outline-none focus:border-brand-accent"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-muted">Valor (R$)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.valor}
              onChange={(event) =>
                setForm((current) => ({ ...current, valor: toNumber(event.target.value) }))
              }
              className="w-full rounded-2xl border border-brand-border bg-brand-bg/60 px-4 py-3 font-semibold text-brand-danger outline-none focus:border-brand-accent"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-brand-muted">Vincular a obra</span>
            <SelectField
              value={form.obraId}
              onChange={(value) =>
                setForm((current) => ({ ...current, obraId: value }))
              }
            >
              <option value="">Sem vinculacao</option>
              {state.obras.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.localizacao}
                </option>
              ))}
            </SelectField>
          </label>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-3xl border border-brand-border bg-brand-bg/55 p-4">
          <div>
            <p className="text-sm text-brand-muted">Saida atual</p>
            <p className="text-2xl font-bold text-brand-danger">{formatBRL(form.valor)}</p>
          </div>
          <button
            type="button"
            onClick={saveDespesa}
            className="rounded-xl bg-brand-accent px-5 py-3 font-bold text-brand-bg transition hover:brightness-110"
          >
            Salvar despesa
          </button>
        </div>
      </Card>

      <Card className="animate-fade-slide">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-syne text-2xl font-bold text-brand-text">Lista de despesas</h3>
          <span className="rounded-full border border-brand-border px-3 py-1 text-sm text-brand-muted">
            {state.despesas.length} despesa(s)
          </span>
        </div>

        <div className="space-y-3">
          {state.despesas.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-brand-border p-6 text-center text-brand-muted">
              Nenhuma despesa cadastrada.
            </p>
          ) : (
            [...state.despesas]
              .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
              .map((despesa) => (
                <div
                  key={despesa.id}
                  className="grid gap-4 rounded-3xl border border-brand-border bg-brand-bg/55 p-4 lg:grid-cols-[1fr,1fr,auto]"
                >
                  <div className="space-y-1">
                    <p className="text-sm text-brand-muted">{formatDate(despesa.data)}</p>
                    <p className="font-bold text-brand-text">{despesa.categoria}</p>
                    <p className="text-sm text-brand-muted">{despesa.descricao}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-brand-muted">Obra vinculada</p>
                    <p className="font-semibold text-brand-text">
                      {state.obras.find((obra) => obra.id === despesa.obraId)?.localizacao ?? '-'}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <p className="text-2xl font-bold text-brand-danger">
                      {formatBRL(despesa.valor)}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingDespesa(despesa)}
                        className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-4 py-2 text-sm font-semibold text-brand-text"
                      >
                        <Pencil size={16} />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setDespesaParaExcluir(despesa)}
                        className="inline-flex items-center gap-2 rounded-xl border border-brand-danger/40 px-4 py-2 text-sm font-semibold text-brand-danger"
                      >
                        <Trash2 size={16} />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>

        <div className="mt-5 text-right">
          <p className="text-sm text-brand-muted">Total de despesas</p>
          <p className="text-3xl font-bold text-brand-danger">{formatBRL(totalDespesas)}</p>
        </div>
      </Card>

      <Modal
        isOpen={Boolean(editingDespesa)}
        title="Editar despesa"
        onClose={() => setEditingDespesa(null)}
      >
        {editingDespesa && (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <input
                type="date"
                value={editingDespesa.data}
                onChange={(event) =>
                  setEditingDespesa((current) =>
                    current ? { ...current, data: event.target.value } : current,
                  )
                }
                className="rounded-2xl border border-brand-border bg-brand-bg/60 px-4 py-3 text-brand-text outline-none focus:border-brand-accent"
              />
              <SelectField
                value={editingDespesa.categoria}
                onChange={(value) =>
                  setEditingDespesa((current) =>
                    current
                      ? {
                          ...current,
                          categoria: value as CategoriasDespesa,
                        }
                      : current,
                  )
                }
              >
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </SelectField>
              <input
                type="text"
                value={editingDespesa.descricao}
                onChange={(event) =>
                  setEditingDespesa((current) =>
                    current ? { ...current, descricao: event.target.value } : current,
                  )
                }
                className="rounded-2xl border border-brand-border bg-brand-bg/60 px-4 py-3 text-brand-text outline-none focus:border-brand-accent lg:col-span-2"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={editingDespesa.valor}
                onChange={(event) =>
                  setEditingDespesa((current) =>
                    current ? { ...current, valor: toNumber(event.target.value) } : current,
                  )
                }
                className="rounded-2xl border border-brand-border bg-brand-bg/60 px-4 py-3 font-semibold text-brand-danger outline-none focus:border-brand-accent"
              />
              <SelectField
                value={editingDespesa.obraId ?? ''}
                onChange={(value) =>
                  setEditingDespesa((current) =>
                    current
                      ? {
                          ...current,
                          obraId: value || undefined,
                        }
                      : current,
                  )
                }
              >
                <option value="">Sem vinculacao</option>
                {state.obras.map((obra) => (
                  <option key={obra.id} value={obra.id}>
                    {obra.localizacao}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={saveEdit}
                className="rounded-xl bg-brand-accent px-5 py-3 font-bold text-brand-bg"
              >
                Salvar alteracoes
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(despesaParaExcluir)}
        title="Excluir despesa"
        onClose={() => setDespesaParaExcluir(null)}
      >
        <div className="space-y-5">
          <p className="text-brand-muted">
            Confirme para remover esta despesa do controle financeiro.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDespesaParaExcluir(null)}
              className="rounded-xl border border-brand-border px-4 py-2 font-semibold text-brand-text"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                if (!despesaParaExcluir) return
                deleteDespesa(despesaParaExcluir.id)
                setDespesaParaExcluir(null)
                emitToast({ type: 'success', message: 'Despesa excluida com sucesso.' })
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

export default Despesas
