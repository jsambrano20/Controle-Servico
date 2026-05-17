import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

const Modal = ({ isOpen, title, onClose, children }: ModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-bg/70 p-4 backdrop-blur md:items-center">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] border border-brand-border bg-brand-card p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-syne text-2xl font-bold text-brand-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-brand-border p-2 text-brand-muted transition hover:text-brand-text"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
