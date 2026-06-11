import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  iconLeft?: ReactNode
  iconRight?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, iconLeft, iconRight, className, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1">{label}</label>
      )}
      <div className="relative">
        {iconLeft && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{iconLeft}</div>
        )}
        <input
          ref={ref}
          {...props}
          className={clsx(
            'w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition',
            iconLeft && 'pl-9',
            iconRight && 'pr-9',
            error
              ? 'border-danger focus:border-danger'
              : 'border-border focus:border-accent',
            className
          )}
        />
        {iconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">{iconRight}</div>
        )}
      </div>
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
      {helperText && !error && <p className="text-text-muted text-xs mt-1">{helperText}</p>}
    </div>
  )
})
