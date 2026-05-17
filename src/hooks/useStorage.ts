import { useEffect, useState } from 'react'

const isBrowser = typeof window !== 'undefined'

export const readStorage = <T,>(key: string, initialValue: T): T => {
  if (!isBrowser) return initialValue

  try {
    const item = window.localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : initialValue
  } catch {
    return initialValue
  }
}

export const writeStorage = <T,>(key: string, value: T) => {
  if (!isBrowser) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function useStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() =>
    readStorage<T>(key, initialValue),
  )

  useEffect(() => {
    writeStorage(key, storedValue)
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}

export default useStorage
