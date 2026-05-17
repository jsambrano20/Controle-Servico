import type { Despesa, Filtro, ItemServico, Obra, TipoItemServico } from '../types'

export const formatBRL = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)

export const formatDate = (isoDate: string): string =>
  new Intl.DateTimeFormat('pt-BR').format(new Date(`${isoDate}T12:00:00`))

export const formatPeriod = (start: string, end: string): string => {
  if (start === end) return formatDate(start)

  const [sDay, sMonth] = formatDate(start).split('/').slice(0, 2)
  return `${sDay}/${sMonth} - ${formatDate(end)}`
}

export const toNumber = (value: string | number): number => {
  if (typeof value === 'number') return value
  const normalized = value.replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export const createId = (prefix: string): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export const getItemTypeLabel = (tipo: TipoItemServico) =>
  tipo === 'despesa' ? 'Despesa da obra' : 'Receita da obra'

export const getItemSignedValue = (
  item: Pick<ItemServico, 'quantidade' | 'valorUnitario' | 'tipo'>,
) => {
  const baseValue = item.quantidade * item.valorUnitario
  return item.tipo === 'despesa' ? baseValue * -1 : baseValue
}

export const sumItemSubtotal = (
  item: Pick<ItemServico, 'quantidade' | 'valorUnitario' | 'tipo'>,
) =>
  Number(getItemSignedValue(item).toFixed(2))

export const sumItemAbsoluteValue = (
  item: Pick<ItemServico, 'quantidade' | 'valorUnitario'>,
) =>
  Number((item.quantidade * item.valorUnitario).toFixed(2))

export const sumObraTotal = (itens: ItemServico[]) =>
  Number(itens.reduce((acc, item) => acc + sumItemSubtotal(item), 0).toFixed(2))

export const getTodayIso = () => new Date().toISOString().slice(0, 10)

export const isDateInRange = (
  date: string,
  start: string,
  end: string,
  mode: Filtro['modo'],
) => {
  if (!start) return true
  if (mode === 'unica') return date === start
  if (!end) return date >= start
  return date >= start && date <= end
}

export const obraMatchesFilter = (obra: Obra, filtro: Filtro) => {
  const finalDate = filtro.modo === 'unica' ? filtro.dataInicio : filtro.dataFim || filtro.dataInicio
  const startsBeforeEnd = !finalDate || obra.periodoInicio <= finalDate
  const endsAfterStart = !filtro.dataInicio || obra.periodoFim >= filtro.dataInicio
  const obraIdMatches = !filtro.obraId || obra.id === filtro.obraId
  return startsBeforeEnd && endsAfterStart && obraIdMatches
}

export const despesaMatchesFilter = (
  despesa: Despesa,
  filtro: Filtro,
  obras: Obra[],
) => {
  const dateMatches = isDateInRange(
    despesa.data,
    filtro.dataInicio,
    filtro.dataFim,
    filtro.modo,
  )
  if (!dateMatches) return false
  if (!filtro.obraId) return true
  return (
    despesa.obraId === filtro.obraId ||
    obras.some((obra) => obra.id === filtro.obraId && obra.id === despesa.obraId)
  )
}
