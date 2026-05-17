import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

const Card = ({ children, className = '' }: CardProps) => (
  <section
    className={`rounded-[1.75rem] border border-brand-border bg-brand-card/95 p-4 shadow-soft backdrop-blur ${className}`}
  >
    {children}
  </section>
)

export default Card
