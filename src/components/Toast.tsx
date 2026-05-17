import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { ToastPayload } from '../types'

const TOAST_EVENT = 'cs:toast'

export const emitToast = (payload: ToastPayload) => {
  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: payload }))
}

const Toast = () => {
  const [toast, setToast] = useState<ToastPayload | null>(null)

  useEffect(() => {
    let timeoutId = 0

    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<ToastPayload>
      setToast(customEvent.detail)
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => setToast(null), 3000)
    }

    window.addEventListener(TOAST_EVENT, handleToast)
    return () => {
      window.removeEventListener(TOAST_EVENT, handleToast)
      window.clearTimeout(timeoutId)
    }
  }, [])

  if (!toast) return null

  const isSuccess = toast.type === 'success'

  return (
    <div className="fixed bottom-24 right-4 z-50 animate-fade-slide md:bottom-6">
      <div
        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-soft ${
          isSuccess
            ? 'border-brand-success/40 bg-brand-success/15 text-brand-success'
            : 'border-brand-danger/40 bg-brand-danger/15 text-brand-danger'
        }`}
      >
        {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <span className="text-sm font-semibold">{toast.message}</span>
      </div>
    </div>
  )
}

export default Toast
