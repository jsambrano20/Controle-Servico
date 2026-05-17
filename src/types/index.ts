export type TipoItemServico = 'receita' | 'despesa'

export interface ItemServico {
  id: string
  tipo: TipoItemServico
  servico: string
  descricao: string
  quantidade: number
  unidade: 'mts' | 'km' | 'un' | 'h' | 'm²' | 'outro'
  valorUnitario: number
  subtotal: number
}

export interface Obra {
  id: string
  periodoInicio: string
  periodoFim: string
  localizacao: string
  itens: ItemServico[]
  totalObra: number
  criadoEm: string
}

export type CategoriasDespesa =
  | 'Pedágio'
  | 'Combustível'
  | 'Alimentação'
  | 'Hospedagem'
  | 'Material'
  | 'Outro'

export interface Despesa {
  id: string
  data: string
  categoria: CategoriasDespesa
  descricao: string
  valor: number
  obraId?: string
  criadoEm: string
}

export type ModoFiltroData = 'unica' | 'periodo'

export interface Filtro {
  modo: ModoFiltroData
  dataInicio: string
  dataFim: string
  obraId?: string
}

export interface AppState {
  obras: Obra[]
  despesas: Despesa[]
  filtro: Filtro
}

export type AppAction =
  | { type: 'ADD_OBRA'; payload: Obra }
  | { type: 'UPDATE_OBRA'; payload: Obra }
  | { type: 'DELETE_OBRA'; payload: string }
  | { type: 'ADD_DESPESA'; payload: Despesa }
  | { type: 'UPDATE_DESPESA'; payload: Despesa }
  | { type: 'DELETE_DESPESA'; payload: string }
  | { type: 'SET_FILTRO'; payload: Partial<Filtro> }

export interface ToastPayload {
  type: 'success' | 'error'
  message: string
}
