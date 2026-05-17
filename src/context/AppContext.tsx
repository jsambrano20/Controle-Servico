import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  useMemo,
  type Dispatch,
  type ReactNode,
} from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  deleteField,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './AuthContext'
import { readStorage, writeStorage } from '../hooks/useStorage'
import { getTodayIso, sumItemSubtotal, sumObraTotal } from '../utils/formatters'
import type {
  AppAction,
  AppState,
  Despesa,
  Filtro,
  ItemServico,
  Obra,
  TipoItemServico,
} from '../types'

const FILTRO_KEY = 'cs_filtro'

const defaultFiltro: Filtro = {
  modo: 'periodo',
  dataInicio: getTodayIso(),
  dataFim: getTodayIso(),
}

const normalizeStoredItem = (
  item: Omit<ItemServico, 'tipo'> & { tipo?: TipoItemServico },
): ItemServico => {
  const normalizedItem: ItemServico = {
    ...item,
    tipo: item.tipo ?? 'receita',
    subtotal: 0,
  }
  return { ...normalizedItem, subtotal: sumItemSubtotal(normalizedItem) }
}

const normalizeStoredObra = (obra: Obra): Obra => {
  const itens = obra.itens.map((item) => normalizeStoredItem(item as ItemServico))
  return { ...obra, itens, totalObra: sumObraTotal(itens) }
}

const filtroReducer = (state: Filtro, action: AppAction): Filtro => {
  if (action.type !== 'SET_FILTRO') return state
  return {
    ...state,
    ...action.payload,
    dataFim:
      action.payload.modo === 'unica'
        ? action.payload.dataInicio ?? state.dataInicio
        : action.payload.dataFim ?? state.dataFim,
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: Dispatch<AppAction>
  addObra: (obra: Omit<Obra, 'id' | 'criadoEm'>) => Promise<void>
  updateObra: (obra: Obra) => Promise<void>
  deleteObra: (id: string) => Promise<void>
  addDespesa: (despesa: Omit<Despesa, 'id' | 'criadoEm'>) => Promise<void>
  updateDespesa: (despesa: Despesa) => Promise<void>
  deleteDespesa: (id: string) => Promise<void>
} | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [obras, setObras] = useState<Obra[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [filtro, dispatch] = useReducer(
    filtroReducer,
    defaultFiltro,
    () => readStorage<Filtro>(FILTRO_KEY, defaultFiltro),
  )

  useEffect(() => {
    writeStorage(FILTRO_KEY, filtro)
  }, [filtro])

  useEffect(() => {
    if (!uid) {
      setObras([])
      setDespesas([])
      return
    }

    const obrasQ = query(
      collection(db, `users/${uid}/obras`),
      orderBy('criadoEm', 'desc'),
    )
    const unsubObras = onSnapshot(obrasQ, (snap) => {
      setObras(snap.docs.map((d) => normalizeStoredObra(d.data() as Obra)))
    })

    const despesasQ = query(
      collection(db, `users/${uid}/despesas`),
      orderBy('criadoEm', 'desc'),
    )
    const unsubDespesas = onSnapshot(despesasQ, (snap) => {
      setDespesas(snap.docs.map((d) => d.data() as Despesa))
    })

    return () => {
      unsubObras()
      unsubDespesas()
    }
  }, [uid])

  const actions = useMemo(() => {
    const addObra = async (obraData: Omit<Obra, 'id' | 'criadoEm'>) => {
      if (!uid) return
      const obra: Obra = {
        ...obraData,
        id: `obra_${Date.now()}`,
        criadoEm: new Date().toISOString(),
      }
      await setDoc(doc(db, `users/${uid}/obras/${obra.id}`), obra)
    }

    const updateObra = async (obra: Obra) => {
      if (!uid) return
      await setDoc(doc(db, `users/${uid}/obras/${obra.id}`), obra)
    }

    const deleteObra = async (id: string) => {
      if (!uid) return
      await deleteDoc(doc(db, `users/${uid}/obras/${id}`))
      const linked = despesas.filter((d) => d.obraId === id)
      await Promise.all(
        linked.map((d) =>
          updateDoc(doc(db, `users/${uid}/despesas/${d.id}`), { obraId: deleteField() }),
        ),
      )
    }

    const addDespesa = async (despesaData: Omit<Despesa, 'id' | 'criadoEm'>) => {
      if (!uid) return
      const despesa: Despesa = {
        ...despesaData,
        id: `desp_${Date.now()}`,
        criadoEm: new Date().toISOString(),
      }
      await setDoc(doc(db, `users/${uid}/despesas/${despesa.id}`), despesa)
    }

    const updateDespesa = async (despesa: Despesa) => {
      if (!uid) return
      await setDoc(doc(db, `users/${uid}/despesas/${despesa.id}`), despesa)
    }

    const deleteDespesa = async (id: string) => {
      if (!uid) return
      await deleteDoc(doc(db, `users/${uid}/despesas/${id}`))
    }

    return { addObra, updateObra, deleteObra, addDespesa, updateDespesa, deleteDespesa }
  }, [uid, despesas])

  return (
    <AppContext.Provider
      value={{ state: { obras, despesas, filtro }, dispatch, ...actions }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
