import { type ReactNode } from 'react'
import { clsx } from 'clsx'

const variants = {
  default: 'bg-white shadow-card border border-border',
  navy: 'bg-primary text-white',
  accent: 'bg-white border-2 border-accent shadow-card',
}

interface CardProps {
  variant?: keyof typeof variants
  hover?: boolean
  className?: string
  children: ReactNode
}

export function Card({ variant = 'default', hover = false, className, children }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl p-5',
        variants[variant],
        hover && 'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
