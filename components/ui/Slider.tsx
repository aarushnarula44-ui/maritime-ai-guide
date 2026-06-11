'use client'

import { type InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  showValue?: boolean
  valuePrefix?: string
  valueSuffix?: string
}

export function Slider({
  label,
  showValue = true,
  valuePrefix = '',
  valueSuffix = '%',
  className,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderProps) {
  const pct = value !== undefined && min !== undefined && max !== undefined
    ? ((Number(value) - Number(min)) / (Number(max) - Number(min))) * 100
    : 0

  return (
    <div className={clsx('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
          {showValue && (
            <span className="text-accent font-bold text-lg">
              {valuePrefix}{value}{valueSuffix}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          value={value}
          min={min}
          max={max}
          {...props}
          className="w-full h-2 appearance-none rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, #00D4FF 0%, #00D4FF ${pct}%, #E2E8F0 ${pct}%, #E2E8F0 100%)`,
          }}
        />
      </div>
    </div>
  )
}
